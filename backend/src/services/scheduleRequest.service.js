const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createScheduleRequest = async (requestData) => {
    try {
        const {
            requestType,
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
            reason,
            note
        } = requestData;

        // Map requestType to requestTypeId
        let requestTypeId = 1; // Default to room_request
        if (requestType === 'schedule_change') {
            requestTypeId = 2;
        } else if (requestType === 'exception') {
            requestTypeId = 3;
        }

        const scheduleRequest = await prisma.scheduleRequest.create({
            data: {
                requestTypeId,
                classScheduleId: classScheduleId || null,
                classRoomId: classRoomId || null,
                requesterId,
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
                reason,
                note: note || null,
                requestStatusId: 1 // 1 = pending
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
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        },
                        timeSlot: {
                            select: {
                                id: true,
                                slotName: true,
                                startTime: true,
                                endTime: true,
                                shift: true
                            }
                        }
                    }
                },
                oldClassRoom: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        capacity: true,
                        ClassRoomType: {
                            select: {
                                id: true,
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
                                id: true,
                                name: true
                            }
                        }
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
        const { status, requesterId } = filters;

        const where = {};
        if (status) {
            // Map status string to requestStatusId
            if (status === 'pending') {
                where.requestStatusId = 1;
            } else if (status === 'approved') {
                where.requestStatusId = 2;
            } else if (status === 'rejected') {
                where.requestStatusId = 3;
            }
        }
        if (requesterId) where.requesterId = parseInt(requesterId);

        const scheduleRequests = await prisma.scheduleRequest.findMany({
            where,
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
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        },
                        timeSlot: {
                            select: {
                                id: true,
                                slotName: true,
                                startTime: true,
                                endTime: true,
                                shift: true
                            }
                        }
                    }
                },
                oldClassRoom: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                        capacity: true,
                        ClassRoomType: {
                            select: {
                                id: true,
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
                                id: true,
                                name: true
                            }
                        }
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
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return scheduleRequests;
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
                        building: true,
                        floor: true,
                        campus: true,
                        classRoomTypeId: true,
                        ClassRoomType: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                timeSlot: {
                    select: {
                        id: true,
                        slotName: true,
                        startTime: true,
                        endTime: true,
                        shift: true
                    }
                }
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { timeSlotId: 'asc' }
            ]
        });
        return classSchedules;
    } catch (error) {
        throw new Error(`Lỗi lấy lịch giảng viên: ${error.message}`);
    }
};

const updateScheduleRequestStatus = async (requestId, status, note) => {
    try {
        // Map status string to requestStatusId
        let requestStatusId = 1; // Default to pending
        if (status === 'approved') {
            requestStatusId = 2;
        } else if (status === 'rejected') {
            requestStatusId = 3;
        }

        const request = await prisma.scheduleRequest.update({
            where: { id: parseInt(requestId) },
            data: {
                requestStatusId,
                note,
                approvedAt: new Date()
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
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        },
                        timeSlot: {
                            select: {
                                id: true,
                                slotName: true,
                                startTime: true,
                                endTime: true,
                                shift: true
                            }
                        }
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
                }
            }
        });

        return request;
    } catch (error) {
        throw new Error(`Lỗi cập nhật trạng thái yêu cầu: ${error.message}`);
    }
};

const getScheduleRequestById = async (requestId) => {
    try {
        const request = await prisma.scheduleRequest.findUnique({
            where: { id: parseInt(requestId) },
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
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        },
                        timeSlot: {
                            select: {
                                id: true,
                                slotName: true,
                                startTime: true,
                                endTime: true,
                                shift: true
                            }
                        }
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
                }
            }
        });

        return request;
    } catch (error) {
        console.error('Error getting schedule request by id:', error);
        throw error;
    }
};

const updateScheduleRequestRoom = async (requestId, newRoomId) => {
    try {
        const scheduleRequest = await prisma.scheduleRequest.update({
            where: {
                id: parseInt(requestId)
            },
            data: {
                newClassRoomId: parseInt(newRoomId)
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
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        },
                        timeSlot: {
                            select: {
                                id: true,
                                slotName: true,
                                startTime: true,
                                endTime: true,
                                shift: true
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
                                id: true,
                                name: true
                            }
                        }
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
                }
            }
        });

        return scheduleRequest;
    } catch (error) {
        console.error('Error updating schedule request room:', error);
        throw error;
    }
};

module.exports = {
    createScheduleRequest,
    getScheduleRequests,
    getTeacherSchedules,
    updateScheduleRequestStatus,
    getScheduleRequestById,
    updateScheduleRequestRoom
};