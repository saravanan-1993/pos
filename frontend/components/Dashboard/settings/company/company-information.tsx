"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Building2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";

// Removed: CountryStateCitySelect, ZipCodeInput

interface CompanyData {
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  gstNumber: string;
}

export const CompanyInformation = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData>({
    companyName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    email: "",
    gstNumber: "",
  });

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/admin/auth/me");
      if (response.data.success) {
        const admin = response.data.data;
        setCompanyData({
          companyName: admin.companyName || "",
          address: admin.address || "",
          city: admin.city || "",
          state: admin.state || "",
          zipCode: admin.zipCode || "",
          country: admin.country || "",
          phone: admin.phoneNumber || "",
          email: admin.email || "",
          gstNumber: admin.gstNumber || "",
        });
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
      toast.error("Failed to load company information");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof CompanyData, value: string) => {
    setCompanyData((prev) => ({ ...prev, [field]: value }));
  };

  const validateGST = (gst: string): boolean => {
    if (!gst) return true; // Optional field
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
      gst
    );
  };

  const handleSave = async () => {
    try {
      if (!companyData.companyName.trim()) {
        toast.error("Company name is required");
        return;
      }

      if (companyData.gstNumber && !validateGST(companyData.gstNumber)) {
        toast.error(
          "Invalid GST number format. Example: 22AAAAA0000A1Z5"
        );
        return;
      }

      setIsSaving(true);

      const response = await axiosInstance.put("/api/admin/auth/profile", {
        companyName: companyData.companyName,
        address: companyData.address,
        city: companyData.city,
        state: companyData.state,
        zipCode: companyData.zipCode,
        country: companyData.country,
        phoneNumber: companyData.phone,
        gstNumber: companyData.gstNumber,
      });

      if (response.data.success) {
        toast.success("Company information updated successfully");
        setIsEditing(false);
        if (user) {
          updateUser({
            ...user,
            companyName: companyData.companyName,
            address: companyData.address,
            city: companyData.city,
            state: companyData.state,
            zipCode: companyData.zipCode,
            country: companyData.country,
            phoneNumber: companyData.phone,
            gstNumber: companyData.gstNumber,
          });
        }
      }
    } catch (error: any) {
      console.error("Error updating company information:", error);
      const errorMsg =
        error.response?.data?.error || "Failed to update company information";
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchCompanyData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Manage your business and company details
                </CardDescription>
              </div>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Company Details */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium">
                Company Name <span className="text-destructive">*</span>
              </Label>
              {isEditing ? (
                <Input
                  value={companyData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="Enter company name"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {companyData.companyName || "Not provided"}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email</Label>
              <p className="text-sm text-muted-foreground">
                {companyData.email || "Not provided"}
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Phone Number</Label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={companyData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    handleChange("phone", value);
                  }}
                  placeholder="Enter phone number"
                  inputMode="numeric"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {companyData.phone || "Not provided"}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Location</h3>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Address</Label>
              {isEditing ? (
                <Input
                  value={companyData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Street address"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {companyData.address || "Not provided"}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Country */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Country</Label>
                {isEditing ? (
                  <Input
                    value={companyData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    placeholder="Enter country"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {companyData.country || "Not provided"}
                  </p>
                )}
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">State</Label>
                {isEditing ? (
                  <Input
                    value={companyData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    placeholder="Enter state"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {companyData.state || "Not provided"}
                  </p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">City</Label>
                {isEditing ? (
                  <Input
                    value={companyData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="Enter city"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {companyData.city || "Not provided"}
                  </p>
                )}
              </div>

              {/* ZIP Code */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">ZIP/Postal Code</Label>
                {isEditing ? (
                  <Input
                    value={companyData.zipCode}
                    onChange={(e) => handleChange("zipCode", e.target.value)}
                    placeholder="Enter postal code"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {companyData.zipCode || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Tax Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Tax Information</h3>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                GST Number (Optional)
              </Label>
              {isEditing ? (
                <div className="space-y-1">
                  <Input
                    value={companyData.gstNumber}
                    onChange={(e) =>
                      handleChange(
                        "gstNumber",
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="e.g., 22AAAAA0000A1Z5"
                    maxLength={15}
                    className={
                      companyData.gstNumber &&
                      !validateGST(companyData.gstNumber)
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {companyData.gstNumber &&
                    !validateGST(companyData.gstNumber) && (
                      <p className="text-xs text-red-500">
                        Invalid GST format. Format: 22AAAAA0000A1Z5
                      </p>
                    )}
                  <p className="text-xs text-muted-foreground">
                    GST Identification Number for invoice generation
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {companyData.gstNumber || "Not provided"}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
