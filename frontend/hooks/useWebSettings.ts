import { useState, useEffect } from "react";
import { getWebSettings, type WebSettings } from "@/services/online-services/webSettingsService";

export const useWebSettings = () => {
  const [settings, setSettings] = useState<WebSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await getWebSettings();
        if (response.success) {
          setSettings(response.data);
        } else {
          setError("Failed to load web settings");
        }
      } catch (err) {
        console.error("Error fetching web settings:", err);
        setError("Failed to load web settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, isLoading, error, logoUrl: settings?.logoUrl || null };
};
