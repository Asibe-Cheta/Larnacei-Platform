import { prisma } from './prisma';
import { cacheManager } from './redis';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Security interfaces
export interface KYCVerification {
  userId: string;
  documentType: string;
  documentNumber: string;
  documentUrl: string;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_REVIEW';
  aiScore: number;
  manualReview: boolean;
  rejectionReason?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
}

export interface BackgroundCheck {
  userId: string;
  checkType: 'BASIC' | 'COMPREHENSIVE' | 'CRIMINAL' | 'FINANCIAL';
  status: 'PENDING' | 'PASSED' | 'FAILED' | 'INCONCLUSIVE';
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  findings: string[];
  completedAt?: Date;
}

export interface DataProtection {
  userId: string;
  consentStatus: {
    marketing: boolean;
    dataSharing: boolean;
    analytics: boolean;
    thirdParty: boolean;
  };
  dataRetention: {
    personalData: Date;
    transactionData: Date;
    analyticsData: Date;
  };
  anonymizationStatus: boolean;
  lastReview: Date;
}

export interface SecurityAudit {
  id: string;
  userId: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  riskScore: number;
  flagged: boolean;
}

export interface NigerianCompliance {
  ninVerified: boolean;
  bvnVerified: boolean;
  addressVerified: boolean;
  phoneVerified: boolean;
  complianceScore: number;
  lastUpdated: Date;
}

export class SecurityService {
  // AI-powered KYC verification
  async verifyKYC(verificationData: {
    userId: string;
    documentType: string;
    documentNumber: string;
    documentUrl: string;
  }): Promise<KYCVerification> {
    const { userId, documentType, documentNumber, documentUrl } = verificationData;

    // Validate Nigerian document formats
    const documentValidation = this.validateNigerianDocument(documentType, documentNumber);
    
    // AI-powered document analysis
    const aiAnalysis = await this.analyzeDocumentWithAI(documentUrl, documentType);
    
    // Calculate verification score
    const verificationScore = this.calculateVerificationScore(documentValidation, aiAnalysis);
    
    // Determine verification status
    const verificationStatus = this.determineVerificationStatus(verificationScore);
    
    // Create verification record
    const verification = await prisma.verificationDocument.create({
      data: {
        userId,
        documentType: documentType as any,
        documentUrl,
        documentNumber,
        verificationStatus: verificationStatus as any,
        verifiedAt: verificationStatus === 'APPROVED' ? new Date() : undefined,
        verifiedBy: verificationStatus === 'APPROVED' ? 'AI_SYSTEM' : undefined
      }
    });

    // Update user verification level
    await this.updateUserVerificationLevel(userId, verificationStatus);

    return {
      userId,
      documentType,
      documentNumber,
      documentUrl,
      verificationStatus,
      aiScore: verificationScore,
      manualReview: verificationScore < 0.7,
      verifiedAt: verification.verifiedAt || undefined,
      verifiedBy: verification.verifiedBy || undefined
    };
  }

  // Background check system
  async performBackgroundCheck(
    userId: string, 
    checkType: 'BASIC' | 'COMPREHENSIVE' | 'CRIMINAL' | 'FINANCIAL'
  ): Promise<BackgroundCheck> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        phone: true, 
        name: true,
        location: true,
        kycStatus: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Perform different types of checks
    let checkResults;
    switch (checkType) {
      case 'BASIC':
        checkResults = await this.performBasicCheck(user);
        break;
      case 'COMPREHENSIVE':
        checkResults = await this.performComprehensiveCheck(user);
        break;
      case 'CRIMINAL':
        checkResults = await this.performCriminalCheck(user);
        break;
      case 'FINANCIAL':
        checkResults = await this.performFinancialCheck(user);
        break;
    }

    // Store background check results
    const backgroundCheck = await prisma.backgroundCheck.create({
      data: {
        userId,
        checkType: checkType as any,
        status: checkResults.status as any,
        score: checkResults.score,
        riskLevel: checkResults.riskLevel as any,
        findings: checkResults.findings,
        completedAt: new Date()
      }
    });

    return {
      userId,
      checkType,
      status: checkResults.status,
      score: checkResults.score,
      riskLevel: checkResults.riskLevel,
      findings: checkResults.findings,
      completedAt: backgroundCheck.completedAt
    };
  }

  // Data protection and privacy management
  async manageDataProtection(userId: string): Promise<DataProtection> {
    // Get current consent status
    const currentConsent = await this.getUserConsentStatus(userId);
    
    // Check data retention policies
    const retentionStatus = await this.checkDataRetention(userId);
    
    // Anonymize old data if needed
    const anonymizationStatus = await this.anonymizeOldData(userId);

    const dataProtection: DataProtection = {
      userId,
      consentStatus: currentConsent,
      dataRetention: retentionStatus,
      anonymizationStatus,
      lastReview: new Date()
    };

    // Store data protection status
    await prisma.dataProtection.upsert({
      where: { userId },
      update: {
        consentStatus: currentConsent,
        dataRetention: retentionStatus,
        anonymizationStatus,
        lastReview: new Date()
      },
      create: {
        userId,
        consentStatus: currentConsent,
        dataRetention: retentionStatus,
        anonymizationStatus,
        lastReview: new Date()
      }
    });

    return dataProtection;
  }

  // Security audit logging
  async logSecurityAudit(auditData: {
    userId: string;
    action: string;
    resource: string;
    ipAddress: string;
    userAgent: string;
  }): Promise<SecurityAudit> {
    const { userId, action, resource, ipAddress, userAgent } = auditData;

    // Calculate risk score
    const riskScore = await this.calculateRiskScore(userId, action, ipAddress);
    
    // Check if action should be flagged
    const flagged = riskScore > 0.7;

    // Create audit log
    const audit = await prisma.securityAudit.create({
      data: {
        userId,
        action,
        resource,
        ipAddress,
        userAgent,
        timestamp: new Date(),
        riskScore,
        flagged
      }
    });

    // Trigger security alerts if needed
    if (flagged) {
      await this.triggerSecurityAlert(audit);
    }

    return {
      id: audit.id,
      userId,
      action,
      resource,
      ipAddress,
      userAgent,
      timestamp: audit.timestamp,
      riskScore,
      flagged
    };
  }

  // Nigerian compliance verification
  async verifyNigerianCompliance(userId: string): Promise<NigerianCompliance> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        phone: true, 
        location: true,
        kycStatus: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify NIN (National Identification Number)
    const ninVerified = await this.verifyNIN(user);
    
    // Verify BVN (Bank Verification Number)
    const bvnVerified = await this.verifyBVN(user);
    
    // Verify address
    const addressVerified = await this.verifyAddress(user);
    
    // Verify phone number
    const phoneVerified = await this.verifyPhoneNumber(user.phone);

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore({
      ninVerified,
      bvnVerified,
      addressVerified,
      phoneVerified
    });

    const compliance: NigerianCompliance = {
      ninVerified,
      bvnVerified,
      addressVerified,
      phoneVerified,
      complianceScore,
      lastUpdated: new Date()
    };

    // Store compliance status
    await prisma.nigerianCompliance.upsert({
      where: { userId },
      update: compliance,
      create: { userId, ...compliance }
    });

    return compliance;
  }

  // Helper methods
  private validateNigerianDocument(documentType: string, documentNumber: string): {
    isValid: boolean;
    confidence: number;
    errors: string[];
  } {
    const errors: string[] = [];
    let confidence = 1.0;

    switch (documentType) {
      case 'NIN':
        // NIN should be 11 digits
        if (!/^\d{11}$/.test(documentNumber)) {
          errors.push('NIN must be exactly 11 digits');
          confidence -= 0.5;
        }
        break;
      
      case 'BVN':
        // BVN should be 11 digits
        if (!/^\d{11}$/.test(documentNumber)) {
          errors.push('BVN must be exactly 11 digits');
          confidence -= 0.5;
        }
        break;
      
      case 'DRIVERS_LICENSE':
        // Nigerian driver's license format
        if (!/^[A-Z]{3}\d{6}[A-Z]{2}\d{2}$/.test(documentNumber)) {
          errors.push('Invalid driver\'s license format');
          confidence -= 0.3;
        }
        break;
      
      case 'VOTERS_CARD':
        // Voter's card format
        if (!/^\d{20}$/.test(documentNumber)) {
          errors.push('Invalid voter\'s card format');
          confidence -= 0.3;
        }
        break;
      
      case 'PASSPORT':
        // Nigerian passport format
        if (!/^[A-Z]\d{8}$/.test(documentNumber)) {
          errors.push('Invalid passport format');
          confidence -= 0.3;
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      confidence: Math.max(confidence, 0),
      errors
    };
  }

  private async analyzeDocumentWithAI(documentUrl: string, documentType: string): Promise<{
    authenticity: number;
    quality: number;
    completeness: number;
    confidence: number;
  }> {
    // Simulate AI document analysis
    // In production, this would integrate with AI services like AWS Textract or Google Vision API
    
    const analysis = {
      authenticity: Math.random() * 0.3 + 0.7, // 70-100%
      quality: Math.random() * 0.2 + 0.8, // 80-100%
      completeness: Math.random() * 0.2 + 0.8, // 80-100%
      confidence: Math.random() * 0.2 + 0.8 // 80-100%
    };

    // Adjust based on document type
    switch (documentType) {
      case 'NIN':
        analysis.authenticity += 0.1;
        break;
      case 'BVN':
        analysis.authenticity += 0.1;
        break;
      case 'PASSPORT':
        analysis.quality += 0.1;
        break;
    }

    return analysis;
  }

  private calculateVerificationScore(
    documentValidation: { isValid: boolean; confidence: number },
    aiAnalysis: { authenticity: number; quality: number; completeness: number; confidence: number }
  ): number {
    const validationWeight = 0.4;
    const aiWeight = 0.6;

    const validationScore = documentValidation.isValid ? documentValidation.confidence : 0;
    const aiScore = (aiAnalysis.authenticity + aiAnalysis.quality + aiAnalysis.completeness) / 3;

    return (validationScore * validationWeight) + (aiScore * aiWeight);
  }

  private determineVerificationStatus(score: number): 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_REVIEW' {
    if (score >= 0.8) return 'APPROVED';
    if (score >= 0.6) return 'IN_REVIEW';
    return 'REJECTED';
  }

  private async updateUserVerificationLevel(userId: string, status: string): Promise<void> {
    let verificationLevel: 'NONE' | 'EMAIL_VERIFIED' | 'PHONE_VERIFIED' | 'ID_VERIFIED' | 'BUSINESS_VERIFIED' | 'FULL_VERIFIED';

    switch (status) {
      case 'APPROVED':
        verificationLevel = 'ID_VERIFIED';
        break;
      case 'IN_REVIEW':
        verificationLevel = 'PHONE_VERIFIED';
        break;
      default:
        verificationLevel = 'EMAIL_VERIFIED';
    }

    await prisma.user.update({
      where: { id: userId },
      data: { 
        verificationLevel: verificationLevel as any,
        kycStatus: status === 'APPROVED' ? 'APPROVED' : 'IN_REVIEW'
      }
    });
  }

  private async performBasicCheck(user: any): Promise<{
    status: 'PASSED' | 'FAILED' | 'INCONCLUSIVE';
    score: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    findings: string[];
  }> {
    const findings: string[] = [];
    let score = 1.0;

    // Check email domain reputation
    const emailDomain = user.email.split('@')[1];
    if (['gmail.com', 'yahoo.com', 'outlook.com'].includes(emailDomain)) {
      score += 0.1;
      findings.push('Reputable email domain');
    } else {
      score -= 0.1;
      findings.push('Uncommon email domain');
    }

    // Check phone number format
    if (user.phone && user.phone.startsWith('+234')) {
      score += 0.1;
      findings.push('Valid Nigerian phone number');
    } else {
      score -= 0.2;
      findings.push('Invalid phone number format');
    }

    // Check location
    if (user.location && this.NIGERIAN_LOCATIONS.includes(user.location)) {
      score += 0.1;
      findings.push('Valid Nigerian location');
    }

    const riskLevel = score >= 0.8 ? 'LOW' : score >= 0.6 ? 'MEDIUM' : 'HIGH';
    const status = score >= 0.7 ? 'PASSED' : score >= 0.5 ? 'INCONCLUSIVE' : 'FAILED';

    return { status, score, riskLevel, findings };
  }

  private async performComprehensiveCheck(user: any): Promise<{
    status: 'PASSED' | 'FAILED' | 'INCONCLUSIVE';
    score: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    findings: string[];
  }> {
    const basicCheck = await this.performBasicCheck(user);
    const findings = [...basicCheck.findings];
    let score = basicCheck.score;

    // Additional comprehensive checks
    // Check for multiple accounts
    const accountCount = await prisma.user.count({
      where: { email: user.email }
    });

    if (accountCount > 1) {
      score -= 0.3;
      findings.push('Multiple accounts detected');
    }

    // Check for suspicious activity
    const recentActivity = await prisma.securityAudit.count({
      where: {
        userId: user.id,
        timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        flagged: true
      }
    });

    if (recentActivity > 0) {
      score -= 0.2;
      findings.push(`${recentActivity} flagged activities in last 24 hours`);
    }

    const riskLevel = score >= 0.8 ? 'LOW' : score >= 0.6 ? 'MEDIUM' : 'HIGH';
    const status = score >= 0.7 ? 'PASSED' : score >= 0.5 ? 'INCONCLUSIVE' : 'FAILED';

    return { status, score, riskLevel, findings };
  }

  private async performCriminalCheck(user: any): Promise<{
    status: 'PASSED' | 'FAILED' | 'INCONCLUSIVE';
    score: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    findings: string[];
  }> {
    // Simulate criminal background check
    // In production, this would integrate with law enforcement databases
    
    const findings: string[] = [];
    let score = 1.0;

    // Check for suspicious patterns
    const suspiciousPatterns = await this.checkSuspiciousPatterns(user.id);
    if (suspiciousPatterns.length > 0) {
      score -= 0.3;
      findings.push(...suspiciousPatterns);
    }

    // Check for known fraud patterns
    const fraudPatterns = await this.checkFraudPatterns(user.id);
    if (fraudPatterns.length > 0) {
      score -= 0.5;
      findings.push(...fraudPatterns);
    }

    const riskLevel = score >= 0.8 ? 'LOW' : score >= 0.6 ? 'MEDIUM' : 'HIGH';
    const status = score >= 0.7 ? 'PASSED' : score >= 0.5 ? 'INCONCLUSIVE' : 'FAILED';

    return { status, score, riskLevel, findings };
  }

  private async performFinancialCheck(user: any): Promise<{
    status: 'PASSED' | 'FAILED' | 'INCONCLUSIVE';
    score: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    findings: string[];
  }> {
    // Simulate financial background check
    // In production, this would integrate with banking APIs
    
    const findings: string[] = [];
    let score = 1.0;

    // Check payment history
    const paymentHistory = await prisma.payment.findMany({
      where: { userId: user.id }
    });

    if (paymentHistory.length === 0) {
      score -= 0.2;
      findings.push('No payment history');
    } else {
      const successfulPayments = paymentHistory.filter(p => p.status === 'SUCCESSFUL');
      const successRate = successfulPayments.length / paymentHistory.length;
      
      if (successRate < 0.8) {
        score -= 0.3;
        findings.push('Low payment success rate');
      } else {
        score += 0.1;
        findings.push('Good payment history');
      }
    }

    const riskLevel = score >= 0.8 ? 'LOW' : score >= 0.6 ? 'MEDIUM' : 'HIGH';
    const status = score >= 0.7 ? 'PASSED' : score >= 0.5 ? 'INCONCLUSIVE' : 'FAILED';

    return { status, score, riskLevel, findings };
  }

  private async getUserConsentStatus(userId: string): Promise<{
    marketing: boolean;
    dataSharing: boolean;
    analytics: boolean;
    thirdParty: boolean;
  }> {
    // Get user consent preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { consentPreferences: true }
    });

    return user?.consentPreferences || {
      marketing: false,
      dataSharing: false,
      analytics: true,
      thirdParty: false
    };
  }

  private async checkDataRetention(userId: string): Promise<{
    personalData: Date;
    transactionData: Date;
    analyticsData: Date;
  }> {
    const now = new Date();
    
    return {
      personalData: new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000), // 2 years
      transactionData: new Date(now.getTime() - 7 * 365 * 24 * 60 * 60 * 1000), // 7 years
      analyticsData: new Date(now.getTime() - 1 * 365 * 24 * 60 * 60 * 1000) // 1 year
    };
  }

  private async anonymizeOldData(userId: string): Promise<boolean> {
    // Anonymize data older than retention period
    const retentionPeriod = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
    
    const oldData = await prisma.user.findMany({
      where: {
        id: userId,
        updatedAt: { lt: retentionPeriod }
      }
    });

    if (oldData.length > 0) {
      // Anonymize personal data
      await prisma.user.updateMany({
        where: {
          id: userId,
          updatedAt: { lt: retentionPeriod }
        },
        data: {
          name: 'Anonymous',
          email: `anonymous_${crypto.randomBytes(8).toString('hex')}@anonymized.com`,
          phone: null,
          location: 'Anonymized'
        }
      });

      return true;
    }

    return false;
  }

  private async calculateRiskScore(
    userId: string, 
    action: string, 
    ipAddress: string
  ): Promise<number> {
    let riskScore = 0.1; // Base risk

    // Check for suspicious actions
    const suspiciousActions = ['login', 'password_change', 'payment', 'property_creation'];
    if (suspiciousActions.includes(action)) {
      riskScore += 0.2;
    }

    // Check for multiple actions in short time
    const recentActions = await prisma.securityAudit.count({
      where: {
        userId,
        timestamp: { gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
      }
    });

    if (recentActions > 10) {
      riskScore += 0.3;
    }

    // Check IP reputation
    const ipReputation = await this.checkIPReputation(ipAddress);
    riskScore += ipReputation;

    return Math.min(riskScore, 1.0);
  }

  private async triggerSecurityAlert(audit: any): Promise<void> {
    // Log security alert
    console.log(`Security Alert: User ${audit.userId} performed ${audit.action} with risk score ${audit.riskScore}`);
    
    // In production, this would send notifications to security team
    // and potentially block the user temporarily
  }

  private async verifyNIN(user: any): Promise<boolean> {
    // Simulate NIN verification
    // In production, this would integrate with NIMC API
    return Math.random() > 0.1; // 90% success rate
  }

  private async verifyBVN(user: any): Promise<boolean> {
    // Simulate BVN verification
    // In production, this would integrate with banking APIs
    return Math.random() > 0.1; // 90% success rate
  }

  private async verifyAddress(user: any): Promise<boolean> {
    // Simulate address verification
    return user.location && this.NIGERIAN_LOCATIONS.includes(user.location);
  }

  private async verifyPhoneNumber(phone: string | null): Promise<boolean> {
    if (!phone) return false;
    return phone.startsWith('+234') && phone.length === 14;
  }

  private calculateComplianceScore(checks: {
    ninVerified: boolean;
    bvnVerified: boolean;
    addressVerified: boolean;
    phoneVerified: boolean;
  }): number {
    let score = 0;
    if (checks.ninVerified) score += 0.3;
    if (checks.bvnVerified) score += 0.3;
    if (checks.addressVerified) score += 0.2;
    if (checks.phoneVerified) score += 0.2;
    return score;
  }

  private async checkSuspiciousPatterns(userId: string): Promise<string[]> {
    const patterns: string[] = [];
    
    // Check for rapid property creation
    const recentProperties = await prisma.property.count({
      where: {
        ownerId: userId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });

    if (recentProperties > 5) {
      patterns.push('Rapid property creation detected');
    }

    return patterns;
  }

  private async checkFraudPatterns(userId: string): Promise<string[]> {
    const patterns: string[] = [];
    
    // Check for suspicious payment patterns
    const payments = await prisma.payment.findMany({
      where: { userId }
    });

    const failedPayments = payments.filter(p => p.status === 'FAILED');
    if (failedPayments.length > payments.length * 0.5) {
      patterns.push('High rate of failed payments');
    }

    return patterns;
  }

  private async checkIPReputation(ipAddress: string): Promise<number> {
    // Simulate IP reputation check
    // In production, this would integrate with IP reputation services
    
    // Check if IP is from Nigeria
    if (ipAddress.startsWith('197.') || ipAddress.startsWith('41.')) {
      return 0.1; // Low risk for Nigerian IPs
    }
    
    return 0.3; // Higher risk for non-Nigerian IPs
  }

  // Nigerian locations for validation
  private readonly NIGERIAN_LOCATIONS = [
    'Lagos', 'Abuja', 'Kano', 'Ibadan', 'Kaduna', 'Port Harcourt',
    'Maiduguri', 'Zaria', 'Aba', 'Jos', 'Ilorin', 'Oyo', 'Enugu',
    'Abeokuta', 'Sokoto', 'Onitsha', 'Warri', 'Calabar', 'Uyo'
  ];

  // Clear security caches
  async clearSecurityCaches(): Promise<void> {
    await cacheManager.deletePattern('security:*');
    await cacheManager.deletePattern('kyc:*');
    await cacheManager.deletePattern('background:*');
  }
}

// Export security service instance
export const securityService = new SecurityService(); 