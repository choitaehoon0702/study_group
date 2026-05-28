import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateStudyDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  courseName!: string;

  @IsInt()
  @Min(2)
  @Max(20)
  maxMembers!: number;
}
