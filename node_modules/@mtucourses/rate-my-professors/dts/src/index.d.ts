export interface ISchoolFromSearch {
    id: string;
    name: string;
    city: string;
    state: string;
}
export interface ITeacherFromSearch {
    id: string;
    firstName: string;
    lastName: string;
    school: {
        id: string;
        name: string;
    };
}
export interface ITeacherPage {
    id: string;
    firstName: string;
    lastName: string;
    avgDifficulty: number;
    avgRating: number;
    numRatings: number;
    department: string;
    school: ISchoolFromSearch;
    legacyId: number;
}
declare const _default: {
    searchSchool: (query: string) => Promise<ISchoolFromSearch[]>;
    searchTeacher: (name: string, schoolID: string) => Promise<ITeacherFromSearch[]>;
    getTeacher: (id: string) => Promise<ITeacherPage>;
};
export default _default;
