"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";


interface WarehouseData {
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  manager: string;
  phone: string;
  status: string;
}

interface AddWarehouseProps {
  warehouse?: WarehouseData | null;
  onSubmit: (data: WarehouseData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function AddWarehouse({
  warehouse,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AddWarehouseProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "", // Start empty to allow auto-fill
    manager: "",
    phone: "",
    status: "active",
  });

  // Load initial data when editing
  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || "",
        address: warehouse.address || "",
        city: warehouse.city || "",
        state: warehouse.state || "",
        postalCode: warehouse.postalCode || "",
        country: warehouse.country,
        manager: warehouse.manager || "",
        phone: warehouse.phone || "",
        status: warehouse.status || "active",
      });
    } else {
      // Reset form when warehouse is null (adding new)
      setFormData({
        name: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "", // Start empty to allow auto-fill
        manager: "",
        phone: "",
        status: "active",
      });
    }
  }, [warehouse]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Warehouse Name */}
        <div className="space-y-2 col-span-2">
          <Label htmlFor="name">
            Warehouse Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Enter warehouse name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>

        {/* Address */}
        <div className="space-y-2 col-span-2">
          <Label htmlFor="address">
            Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address"
            placeholder="Street address, building number"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            required
          />
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label htmlFor="country">
            Country <span className="text-destructive">*</span>
          </Label>
          <Input
            id="country"
            placeholder="Enter country"
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
            required
          />
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label htmlFor="state">
            State <span className="text-destructive">*</span>
          </Label>
          <Input
            id="state"
            placeholder="Enter state"
            value={formData.state}
            onChange={(e) => handleChange("state", e.target.value)}
            required
          />
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">
            City <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            placeholder="Enter city"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            required
          />
        </div>

        {/* Pincode */}
        <div className="space-y-2">
          <Label htmlFor="postalCode">
            Pincode <span className="text-destructive">*</span>
          </Label>
         <Input
            id="postalCode"
            placeholder="Enter pincode"
            value={formData.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            required
          />
        </div>

        {/* Manager Name */}
        <div className="space-y-2">
          <Label htmlFor="manager">
            Manager Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="manager"
            placeholder="Enter manager name"
            value={formData.manager}
            onChange={(e) => handleChange("manager", e.target.value)}
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Contact Number <span className="text-destructive">*</span>
          </Label>
          <PhoneInput
            id="phone"
            country={formData.country}
            value={formData.phone}
            onChange={(value) => handleChange("phone", value)}
          />
        </div>
        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">
            Status <span className="text-destructive">*</span>
          </Label>
          <Select
            key={formData.status}
            value={formData.status}
            onValueChange={(value) => handleChange("status", value)}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue>
                {formData.status === "active" ? "Active" : "Inactive"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : warehouse ? "Update Warehouse" : "Add Warehouse"}
        </Button>
      </div>
    </form>
  );
}
