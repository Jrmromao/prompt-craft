-- Add GDPR-related fields
ALTER TABLE "User" ADD COLUMN "dataRetentionPolicy" JSONB DEFAULT '{"retentionPeriod": 365, "autoDelete": false, "dataCategories": ["personal", "usage", "analytics"]}';
ALTER TABLE "User" ADD COLUMN "dataProcessingConsent" JSONB DEFAULT '{"marketing": false, "analytics": false, "thirdParty": false}';

ALTER TABLE "Prompt" ADD COLUMN "dataRetentionPolicy" JSONB DEFAULT '{"retentionPeriod": 365, "autoDelete": false}';
ALTER TABLE "Prompt" ADD COLUMN "isArchived" BOOLEAN DEFAULT false;
ALTER TABLE "Prompt" ADD COLUMN "archivedAt" TIMESTAMP(3);

ALTER TABLE "SupportTicket" ADD COLUMN "dataRetentionPolicy" JSONB DEFAULT '{"retentionPeriod": 730, "autoDelete": false}';
ALTER TABLE "SupportTicket" ADD COLUMN "isArchived" BOOLEAN DEFAULT false;
ALTER TABLE "SupportTicket" ADD COLUMN "archivedAt" TIMESTAMP(3);

ALTER TABLE "DataProcessingRecord" ADD COLUMN "processingDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "DataProcessingRecord" ADD COLUMN "dataCategories" TEXT[];
ALTER TABLE "DataProcessingRecord" ADD COLUMN "thirdPartyRecipients" TEXT[]; 