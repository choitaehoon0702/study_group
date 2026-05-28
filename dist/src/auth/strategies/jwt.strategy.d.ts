import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../types/jwt-payload.type';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    constructor(configService: ConfigService);
    validate(payload: JwtPayload): Promise<{
        id: number;
        email: string;
        name: string;
    }>;
}
export {};
