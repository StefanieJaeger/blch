export type Role = 'admin' | 'voter';

export interface User {
    address: string;
    role: Role;
}