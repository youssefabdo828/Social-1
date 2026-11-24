import { GenderEnum } from "../../common/types/enum";



export type SignUpBody = { 
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    gender: GenderEnum;
    age?: number;
    phone?: string;
};