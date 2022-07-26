public without sharing class JobListingController {

    @auraEnabled
    public static List<SFDC_Job__c> fetchAllJobs() {
        return [
            SELECT Id, Name, Job_Number__c, Job_Type__c,Job_Description__c, Job_Overview__c,
                Job_Compensation__c
            FROM SFDC_Job__c
            WHERE Job_Status__c != '00-Draft' AND Job_Filled__c != 'Yes'
        ];
    }
    
    @auraEnabled
    public static SFDC_Job__c fetchSpecificJob(Id jobId) {
        return [
            SELECT Id, Name, Job_Number__c, Job_Type__c,Job_Description__c, Job_Overview__c,
                Job_Compensation__c
            FROM SFDC_Job__c
            WHERE Id = :jobId
        ];
    }
    
    @auraEnabled
    public static Id applicationSubmit(Id jobId, String candidate) {
        try {
            SFDC_Candidate__c applyingCandidate = (SFDC_Candidate__c)JSON.deserialize(candidate, SFDC_Candidate__c.class);
            insert applyingCandidate;
            
            //create the junction for application
            SFDC_Job_Candidate__c application = new SFDC_Job_Candidate__c(SFDC_Candidate__c = applyingCandidate.Id, SFDC_Job__c = jobId);
            insert application;
            
            return applyingCandidate.Id;
        
        } catch (Exception e) {
            throw new AuraHandledException('Something went wrong: '+ e.getMessage());    
        }
        
    }
    
    @AuraEnabled
    public static Id SaveFile(Id parentId, String fileName, String base64Data, String contentType, Id fileId) {
        try {
            base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
            Attachment attach = new Attachment();
            attach.parentId = parentId;
            attach.Body = EncodingUtil.base64Decode(base64Data);
            attach.Name = fileName;
            attach.ContentType = contentType;
            attach.Id = String.isNotBlank(fileId) ? fileId : null;
            upsert attach;
            return attach.Id;
        
        } catch (Exception e) {
            throw new AuraHandledException('Something went wrong: '+ e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void createReferences(Id candidateId, List<SFDC_Candidate_Reference__c> references) {
        List<SFDC_Candidate_Reference__c> allReferencesToBeInserted = new List<SFDC_Candidate_Reference__c>();
        
        for (SFDC_Candidate_Reference__c eachReference : references) {
            eachReference.Candidate__c = candidateId;
            allReferencesToBeInserted.add(eachReference);
        }
        
        try {
            insert allReferencesToBeInserted;    
        } catch (Exception e) {
            throw new AuraHandledException('Something went wrong: '+ e.getMessage());
        }
    }
    
   @AuraEnabled
    public static SFDC_Candidate_Reference__c fetchSpecificReference(Id referenceId) {
        
        return [
            SELECT Id, Candidate__c, Candidate__r.Name, Candidate__r.Position__c 
            FROM SFDC_Candidate_Reference__c 
            WHERE Id = :referenceId
        ];
    }
    
    @AuraEnabled
    public static void submitReference(SFDC_Candidate_Reference__c reference) {
        
        if (reference == null) {
            return;
        }
        
        reference.Status__c = 'Complete';
        try {
            update reference;
        } catch(Exception e) {
            throw new AuraHandledException('Something went wrong: '+ e.getMessage());
        }
    }
}