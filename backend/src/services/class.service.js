const prisma = require('../config/db.config');

class ClassService {
    async createClassWithMembers(payload) {
        const {
            code,
            className,
            subjectName,
            subjectCode,
            credits,
            teacherId,
            semester,
            academicYear,
            maxStudents,
            totalWeeks,
            startDate,
            endDate,
            description,
            studentIds = [],
            practice = {
                enabled: false,
                groupNumber: 0,
                maxStudentsPerGroup: 0,
                groupNames: []
            }
        } = payload;

        return await prisma.$transaction(async (tx) => {
            // Validate teacher exists
            const existingTeacher = await tx.teacher.findUnique({ where: { id: teacherId } });
            if (!existingTeacher) {
                throw new Error('Giảng viên không tồn tại');
            }

            // Validate students exist
            if (studentIds.length > 0) {
                const existingStudents = await tx.student.findMany({ where: { id: { in: studentIds } }, select: { id: true } });
                const existingIds = new Set(existingStudents.map(s => s.id));
                const missingIds = studentIds.filter(id => !existingIds.has(id));
                if (missingIds.length > 0) {
                    throw new Error(`Các sinh viên không tồn tại: ${missingIds.join(', ')}`);
                }
            }

            // Create class
            const createdClass = await tx.class.create({
                data: {
                    code,
                    className,
                    subjectName,
                    subjectCode,
                    credits,
                    teacherId,
                    semester,
                    academicYear,
                    maxStudents,
                    totalWeeks,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    description: description || null
                }
            });

            // Create theory class type
            const theoryType = await tx.classType.create({
                data: {
                    classId: createdClass.id,
                    type: 'theory',
                    maxStudents: maxStudents,
                    groupNumber: null
                }
            });

            let practiceType = null;
            let createdGroups = [];
            if (practice && practice.enabled) {
                const groupNumber = Number(practice.groupNumber) || 0;
                if (groupNumber <= 0) {
                    throw new Error('Số nhóm thực hành phải lớn hơn 0 khi bật thực hành');
                }

                practiceType = await tx.classType.create({
                    data: {
                        classId: createdClass.id,
                        type: 'practice',
                        maxStudents: maxStudents,
                        groupNumber
                    }
                });

                const groupNames = Array.isArray(practice.groupNames) && practice.groupNames.length === groupNumber
                    ? practice.groupNames
                    : Array.from({ length: groupNumber }, (_, idx) => `Nhóm ${idx + 1}`);

                // Create class groups
                for (const groupName of groupNames) {
                    const group = await tx.classGroup.create({
                        data: {
                            classTypeId: practiceType.id,
                            groupName,
                            maxStudents: Number(practice.maxStudentsPerGroup) > 0
                                ? Number(practice.maxStudentsPerGroup)
                                : Math.ceil(maxStudents / groupNumber)
                        }
                    });
                    createdGroups.push(group);
                }
            }

            // Register students and distribute into practice groups (if any)
            let registrations = [];
            if (studentIds.length > 0) {
                // Round-robin distribute
                const groupIds = createdGroups.map(g => g.id);
                const hasPractice = groupIds.length > 0;

                for (let index = 0; index < studentIds.length; index += 1) {
                    const studentId = studentIds[index];
                    const assignedGroupId = hasPractice
                        ? groupIds[index % groupIds.length]
                        : null;

                    const reg = await tx.classRegistration.create({
                        data: {
                            classId: createdClass.id,
                            studentId,
                            practiceGroupId: assignedGroupId,
                            status: 'approved'
                        }
                    });
                    registrations.push(reg);
                }
            }

            return {
                class: createdClass,
                classTypes: {
                    theory: theoryType,
                    practice: practiceType
                },
                practiceGroups: createdGroups,
                registrations
            };
        });
    }
}

module.exports = new ClassService();


