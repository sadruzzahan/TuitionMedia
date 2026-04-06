import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const messages = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
      throw new BadRequestException(messages);
    }
    return result.data;
  }
}
