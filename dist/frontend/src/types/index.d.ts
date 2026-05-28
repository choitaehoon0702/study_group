export type User = {
    id: number;
    email: string;
    name: string;
};
export type Study = {
    id: number;
    title: string;
    description: string;
    courseName: string;
    maxMembers: number;
    currentMembers?: number;
    leaderId?: number;
    leader?: User;
    members?: StudyMember[];
    materials?: StudyMaterial[];
    polls?: StudyPoll[];
    createdAt: string;
    updatedAt: string;
};
export type StudyMember = {
    id: number;
    studyId: number;
    userId: number;
    role: 'LEADER' | 'MEMBER';
    user?: User;
    createdAt: string;
};
export type StudyApplication = {
    id: number;
    studyId: number;
    userId: number;
    message?: string | null;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    study?: Study;
    user?: User;
    createdAt: string;
    updatedAt: string;
};
export type StudyMaterial = {
    id: number;
    studyId: number;
    uploaderId: number;
    title: string;
    description?: string | null;
    url: string;
    uploader?: User;
    createdAt: string;
    updatedAt: string;
};
export type StudyPoll = {
    id: number;
    studyId: number;
    creatorId: number;
    title: string;
    closed: boolean;
    options: StudyPollOption[];
    createdAt: string;
    updatedAt: string;
};
export type StudyPollOption = {
    id: number;
    pollId: number;
    dateTime: string;
    _count?: {
        votes: number;
    };
    votes?: StudyPollVote[];
};
export type StudyPollVote = {
    id: number;
    pollOptionId: number;
    userId: number;
    user?: User;
    createdAt: string;
};
