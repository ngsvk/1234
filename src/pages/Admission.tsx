import { useState } from 'react';
import { CheckCircle, FileText, Loader2 } from 'lucide-react';
import { useContent } from '@/contexts/ContentContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const admissionSchema = z.object({
  studentName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  contactNumber: z.string().regex(/^[0-9+\-\s]{10,15}$/, "Contact number must be 10-15 digits"),
  parentName: z.string().trim().min(2, "Parent name must be at least 2 characters").max(100, "Parent name must be less than 100 characters"),
  parentContact: z.string().regex(/^[0-9+\-\s]{10,15}$/, "Parent contact must be 10-15 digits"),
  address: z.string().trim().min(10, "Address must be at least 10 characters").max(500, "Address must be less than 500 characters"),
  previousSchool: z.string().trim().min(2, "Previous school name is required").max(200, "School name must be less than 200 characters"),
  sslcResult: z.string().trim().min(1, "SSLC result is required").max(50, "SSLC result must be less than 50 characters"),
  stream: z.string().min(1, "Stream selection is required"),
  preferredLanguage: z.string().min(1, "Language selection is required"),
});

interface FormData {
  studentName: string;
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  email: string;
  address: string;
  parentName: string;
  parentContact: string;
  stream: string;
  previousSchool: string;
  sslcResult: string;
  preferredLanguage: string;
  confirmed: boolean;
}

const initialFormData: FormData = {
  studentName: '',
  dateOfBirth: '',
  gender: '',
  contactNumber: '',
  email: '',
  address: '',
  parentName: '',
  parentContact: '',
  stream: '',
  previousSchool: '',
  sslcResult: '',
  preferredLanguage: '',
  confirmed: false,
};

export default function Admission() {
  const { content } = useContent();
  const { admission } = content;
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    if (!formData.confirmed) {
      toast({
        title: "Error",
        description: "Please confirm that the details are correct",
        variant: "destructive",
      });
      return;
    }

    // Validate form data with zod
    const validationResult = admissionSchema.safeParse(formData);
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      toast({
        title: "Validation Error",
        description: "Please correct the highlighted fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const validatedData = validationResult.data;
      
      // Use edge function with rate limiting
      const { data, error } = await supabase.functions.invoke('submit-admission', {
        body: { formData: validatedData }
      });

      if (error) throw error;

      if (data?.rateLimited) {
        toast({
          title: "Submission Limit Reached",
          description: data.message || "Please try again later.",
          variant: "destructive",
        });
        return;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setSubmitted(true);
      setValidationErrors({});
      toast({
        title: "Success!",
        description: "Your admission form has been submitted successfully.",
      });
    } catch (error: any) {
      const errorMessage = error?.message?.includes('Too many') 
        ? error.message 
        : "Failed to submit application. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <section className="py-16 bg-background min-h-[60vh] flex items-center">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto text-center">
              <CardContent className="pt-12 pb-12">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-green-600" size={48} />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">Thank You!</h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Your admission form has been submitted successfully. Our team will contact you shortly for further verification and document submission.
                </p>
                <Button onClick={() => { setSubmitted(false); setFormData(initialFormData); }}>
                  Submit Another Application
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <section className="gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{admission.title}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{admission.description}</p>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="text-primary" size={24} />
                  Eligibility Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(admission.eligibility || []).map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="text-primary" size={24} />
                  Required Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(admission.documents || []).map((doc, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-title">Admission Application Form</h2>
              <p className="section-subtitle">{admission.instructions}</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Student Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Student Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentName">Student Name *</Label>
                        <Input
                          id="studentName"
                          name="studentName"
                          value={formData.studentName}
                          onChange={handleInputChange}
                          className={validationErrors.studentName ? "border-destructive" : ""}
                          required
                        />
                        {validationErrors.studentName && (
                          <p className="text-sm text-destructive">{validationErrors.studentName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className={validationErrors.dateOfBirth ? "border-destructive" : ""}
                          required
                        />
                        {validationErrors.dateOfBirth && (
                          <p className="text-sm text-destructive">{validationErrors.dateOfBirth}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender *</Label>
                        <Select onValueChange={(v) => handleSelectChange('gender', v)} value={formData.gender}>
                          <SelectTrigger className={validationErrors.gender ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {validationErrors.gender && (
                          <p className="text-sm text-destructive">{validationErrors.gender}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactNumber">Contact Number *</Label>
                        <Input
                          id="contactNumber"
                          name="contactNumber"
                          type="tel"
                          value={formData.contactNumber}
                          onChange={handleInputChange}
                          className={validationErrors.contactNumber ? "border-destructive" : ""}
                          required
                        />
                        {validationErrors.contactNumber && (
                          <p className="text-sm text-destructive">{validationErrors.contactNumber}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={validationErrors.email ? "border-destructive" : ""}
                        required
                      />
                      {validationErrors.email && (
                        <p className="text-sm text-destructive">{validationErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={validationErrors.address ? "border-destructive" : ""}
                        required
                      />
                      {validationErrors.address && (
                        <p className="text-sm text-destructive">{validationErrors.address}</p>
                      )}
                    </div>
                  </div>

                  {/* Parent Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Parent/Guardian Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                        <Input
                          id="parentName"
                          name="parentName"
                          value={formData.parentName}
                          onChange={handleInputChange}
                          className={validationErrors.parentName ? "border-destructive" : ""}
                          required
                        />
                        {validationErrors.parentName && (
                          <p className="text-sm text-destructive">{validationErrors.parentName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="parentContact">Parent/Guardian Contact *</Label>
                        <Input
                          id="parentContact"
                          name="parentContact"
                          type="tel"
                          value={formData.parentContact}
                          onChange={handleInputChange}
                          className={validationErrors.parentContact ? "border-destructive" : ""}
                          required
                        />
                        {validationErrors.parentContact && (
                          <p className="text-sm text-destructive">{validationErrors.parentContact}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Academic Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stream">Stream Applying For *</Label>
                        <Select onValueChange={(v) => handleSelectChange('stream', v)} value={formData.stream}>
                          <SelectTrigger className={validationErrors.stream ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select stream" />
                          </SelectTrigger>
                          <SelectContent>
                            {(admission.streams || []).map((stream) => (
                              <SelectItem key={stream} value={stream}>{stream}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {validationErrors.stream && (
                          <p className="text-sm text-destructive">{validationErrors.stream}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferredLanguage">Preferred Language *</Label>
                        <Select onValueChange={(v) => handleSelectChange('preferredLanguage', v)} value={formData.preferredLanguage}>
                          <SelectTrigger className={validationErrors.preferredLanguage ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kannada">Kannada</SelectItem>
                            <SelectItem value="hindi">Hindi</SelectItem>
                            <SelectItem value="sanskrit">Sanskrit</SelectItem>
                          </SelectContent>
                        </Select>
                        {validationErrors.preferredLanguage && (
                          <p className="text-sm text-destructive">{validationErrors.preferredLanguage}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="previousSchool">Previous School Name *</Label>
                        <Input
                          id="previousSchool"
                          name="previousSchool"
                          value={formData.previousSchool}
                          onChange={handleInputChange}
                          className={validationErrors.previousSchool ? "border-destructive" : ""}
                          required
                        />
                        {validationErrors.previousSchool && (
                          <p className="text-sm text-destructive">{validationErrors.previousSchool}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sslcResult">10th/SSLC Result (Percentage) *</Label>
                        <Input
                          id="sslcResult"
                          name="sslcResult"
                          value={formData.sslcResult}
                          onChange={handleInputChange}
                          className={validationErrors.sslcResult ? "border-destructive" : ""}
                          placeholder="e.g., 85%"
                          required
                        />
                        {validationErrors.sslcResult && (
                          <p className="text-sm text-destructive">{validationErrors.sslcResult}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Confirmation */}
                  <div className="flex items-start space-x-2 pt-4">
                    <Checkbox
                      id="confirmed"
                      checked={formData.confirmed}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, confirmed: !!checked }))}
                    />
                    <Label htmlFor="confirmed" className="text-sm leading-relaxed cursor-pointer">
                      I confirm that all the above details are correct and I understand that any false information may lead to cancellation of admission.
                    </Label>
                  </div>

                  <Button type="submit" className="w-full btn-admission" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
