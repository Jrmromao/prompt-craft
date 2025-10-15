-- Delete duplicate versions, keep only the latest
DELETE FROM "Version" a USING "Version" b
WHERE a.id < b.id 
AND a."promptId" = b."promptId" 
AND a.version = b.version;
