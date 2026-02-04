import { ApiKey, AuditLog } from '@prisma/client';
import { FileUploaded } from 'src/features/file/fileSchemas';

export interface AuditLogWithAuthor extends AuditLog {
  apiKey: Partial<ApiKey>;
  authorEmail?: string;
  authorFirstName?: string;
  authorLastName?: string;
  authorAvatars?: FileUploaded[];
}
