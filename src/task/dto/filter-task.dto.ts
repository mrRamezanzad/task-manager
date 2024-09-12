import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import PaginationDto from 'src/common/dto/pagination.dto';

export default class FilterTaskDto extends PaginationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Transform(({ value }) => value === 'true'? true : false)
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}