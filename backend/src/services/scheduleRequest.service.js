const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createScheduleRequest = async (requestData) => {
    try {
        const {
            requestTypeId,
            classScheduleId,
            classRoomId,
            requesterId,
            requestDate,
            timeSlotId,
            changeType,
            oldClassRoomId,
            newClassRoomId,
            oldTimeSlotId,
            newTimeSlotId,
            exceptionDate,
            exceptionType,
            movedToDate,
            movedToTimeSlotId,
            movedToClassRoomId,
            substituteTeacherId,
            reason
        } = requestData;

        const scheduleRequest = await prisma.scheduleRequest.create({
            data: {
                requestTypeId,
                classScheduleId: classScheduleId || null,
                classRoomId: classRoomId || null,
                requesterId,
                requestStatusId: 1, // pending status
                requestDate: new Date(requestDate),
                timeSlotId,
                changeType: changeType || null,
                oldClassRoomId: oldClassRoomId || null,
                newClassRoomId: newClassRoomId || null,
                oldTimeSlotId: oldTimeSlotId || null,
                newTimeSlotId: newTimeSlotId || null,
                exceptionDate: exceptionDate ? new Date(exceptionDate) : null,
                exceptionType: exceptionType || null,
                movedToDate: movedToDate ? new Date(movedToDate) : null,
                movedToTimeSlotId: movedToTimeSlotId || null,
                movedToClassRoomId: movedToClassRoomId || null,
                substituteTeacherId: substituteTeacherId || null,
                reason
            },
            include: {
                requester: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                RequestType: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                RequestStatus: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                classSchedule: {
                    include: {
                        class: {
                            select: {
                                id: true,
                                code: true,
                                className: true,
                                subjectName: true,
                                subjectCode: true,
                                maxStudents: true
                            }
                        },
                        classRoom: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                capacity: true,
                                ClassRoomType: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        },
                        // Bỏ timeSlot vì không có relation trực tiếp
                    }
                },
                // Bỏ timeSlot vì không có relation trực tiếp
                oldClassRoom: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        capacity: true,
                        ClassRoomType: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                newClassRoom: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        capacity: true,
                        ClassRoomType: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        return scheduleRequest;
    } catch (error) {
        console.error('Error creating schedule request:', error);
        throw error;
    }
};

const getScheduleRequests = async (filters = {}) => {
    try {
        const {
            status,
            requestType,
            requesterId,
            page = 1,
            limit = 10
        } = filters;

        const where = {};
        if (status) where.requestStatusId = parseInt(status);
        if (requestType) where.requestTypeId = parseInt(requestType);
        if (requesterId) where.requesterId = parseInt(requesterId);

        const skip = (page - 1) * limit;

        const [scheduleRequests, total] = await Promise.all([
            prisma.scheduleRequest.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    requester: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true
                        }
                    },
                    RequestType: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    RequestStatus: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    classSchedule: {
                        include: {
                            class: {
                                select: {
                                    id: true,
                                    code: true,
                                    className: true,
                                    subjectName: true,
                                    subjectCode: true,
                                    maxStudents: true
                                }
                            },
                            classRoom: {
                                select: {
                                    id: true,
                                    code: true,
                                    name: true,
                                    capacity: true,
                                    ClassRoomType: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            },
                            // Bỏ timeSlot vì không có relation trực tiếp
                        }
                    },
                    // Bỏ timeSlot vì không có relation trực tiếp
                    oldClassRoom: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                            capacity: true,
                            ClassRoomType: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    newClassRoom: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                            capacity: true,
                            ClassRoomType: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    approver: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            prisma.scheduleRequest.count({ where })
        ]);

        return {
            success: true,
            data: scheduleRequests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('Error getting schedule requests:', error);
        throw error;
    }
};

const getTeacherSchedules = async (teacherId) => {
    try {
        const classSchedules = await prisma.classSchedule.findMany({
            where: {
                teacherId: parseInt(teacherId)
            },
            include: {
                class: {
                    select: {
                        id: true,
                        code: true,
                        className: true,
                        subjectName: true,
                        subjectCode: true,
                        maxStudents: true
                    }
                },
                classRoom: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        capacity: true,
                        ClassRoomType: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
                // Bỏ timeSlot vì không có relation trực tiếp
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { timeSlotId: 'asc' }
            ]
        });

        return classSchedules;
    } catch (error) {
        console.error('Error getting teacher schedules:', error);
        throw error;
    }
};

const updateScheduleRequestStatus = async (requestId, status, approverId, note) => {
    try {
        const scheduleRequest = await prisma.scheduleRequest.update({
            where: {
                id: parseInt(requestId)
            },
            data: {
                status,
                approvedBy: approverId,
                approvedAt: new Date(),
                note: note || null
            },
            include: {
                requester: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                classSchedule: {
                    include: {
                        class: {
                            select: {
                                id: true,
                                code: true,
                                className: true,
                                subjectName: true,
                                subjectCode: true,
                                maxStudents: true
                            }
                        },
                        classRoom: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                capacity: true,
                                ClassRoomType: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        },
                        // Bỏ timeSlot vì không có relation trực tiếp
                    }
                },
                // Bỏ timeSlot vì không có relation trực tiếp
                oldClassRoom: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        capacity: true,
                        ClassRoomType: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                newClassRoom: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        capacity: true,
                        ClassRoomType: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                approver: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            }
        });

        return scheduleRequest;
    } catch (error) {
        console.error('Error updating schedule request status:', error);
        throw error;
    }
};

const getScheduleRequestById = async (requestId) => {
    try {
        const scheduleRequest = await prisma.scheduleRequest.findUnique({
            where: {
                id: parseInt(requestId)
            },
            include: {
                requester: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                },
                classSchedule: {
                    include: {
                        class: {
                            select: {
                                id: true,
                                code: true,
                                className: true,
                                subjectName: true,
                                subjectCode: true,
                                maxStudents: true
                            }
                        },
                        classRoom: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                capacity: true,
                                ClassRoomType: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        },
                        // Bỏ timeSlot vì không có relation trực tiếp
                    }
                },
                // Bỏ timeSlot vì không có relation trực tiếp
                oldClassRoom: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        capacity: true,
                        ClassRoomType: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                newClassRoom: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        capacity: true,
                        ClassRoomType: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                approver: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true
                    }
                }
            }
        });

        return scheduleRequest;
    } catch (error) {
        console.error('Error getting schedule request by id:', error);
        throw error;
    }
};

module.exports = {
    createScheduleRequest,
    getScheduleRequests,
    getTeacherSchedules,
    updateScheduleRequestStatus,
    getScheduleRequestById
};
