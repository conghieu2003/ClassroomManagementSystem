const prisma = require('../config/db.config');

function toHHMM(dateOrString) {
    if (!dateOrString) return null;
    const d = typeof dateOrString === 'string' ? new Date(`1970-01-01T${dateOrString}Z`) : new Date(dateOrString);
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
}

function mapScheduleRow(row) {
    return {
        id: row.id,
        classId: row.classId,
        roomId: row.classRoomId,
        dayOfWeek: row.dayOfWeek,
        startDate: row.date, // frontend expects 'startDate'
        endDate: row.date,
        timeSlot: row.timeSlot?.shift || undefined, // 'morning' | 'afternoon' | 'evening'
        startTime: toHHMM(row.timeSlot?.startTime),
        endTime: toHHMM(row.timeSlot?.endTime),
        status: row.status, // 'normal' | 'exam' | 'cancelled' | 'paused'
        subjectName: row.class?.subjectName,
        roomName: row.classRoom?.name,
        teacherName: row.teacher?.user?.fullName,
        classType: row.classType?.type,
        classGroupId: row.classGroupId ?? null,
        note: row.note || undefined,
    };
}

class ScheduleService {
    async getTeacherSchedule(teacherId) {
        const id = Number(teacherId);
        if (Number.isNaN(id)) throw new Error('teacherId không hợp lệ');

        const rows = await prisma.schedule.findMany({
            where: { teacherId: id },
            include: {
                class: true,
                classRoom: true,
                teacher: { include: { user: true } },
                timeSlot: true,
                classType: true,
            },
            orderBy: [{ date: 'asc' }, { timeSlotId: 'asc' }]
        });
        return rows.map(mapScheduleRow);
    }

    async getStudentSchedule(studentId) {
        const id = Number(studentId);
        if (Number.isNaN(id)) throw new Error('studentId không hợp lệ');

        const regs = await prisma.classRegistration.findMany({
            where: { studentId: id },
            select: { classId: true }
        });
        const classIds = regs.map(r => r.classId);
        if (classIds.length === 0) return [];

        const rows = await prisma.schedule.findMany({
            where: { classId: { in: classIds } },
            include: {
                class: true,
                classRoom: true,
                teacher: { include: { user: true } },
                timeSlot: true,
                classType: true,
            },
            orderBy: [{ date: 'asc' }, { timeSlotId: 'asc' }]
        });
        return rows.map(mapScheduleRow);
    }

    async getRoomSchedule(roomId) {
        const id = Number(roomId);
        if (Number.isNaN(id)) throw new Error('roomId không hợp lệ');

        const rows = await prisma.schedule.findMany({
            where: { classRoomId: id },
            include: {
                class: true,
                classRoom: true,
                teacher: { include: { user: true } },
                timeSlot: true,
                classType: true,
            },
            orderBy: [{ date: 'asc' }, { timeSlotId: 'asc' }]
        });
        return rows.map(mapScheduleRow);
    }
}

module.exports = new ScheduleService();


