/**
 * Generate invoice number from settings
 */
const generateInvoiceNumber = async (tx) => {
  const settings = await tx.invoiceSettings.findFirst();

  if (!settings || !settings.isActive) {
    return null;
  }

  // Calculate financial year
  let financialYear = "";
  if (settings.autoFinancialYear) {
    const now = new Date();
    const fyStart = new Date(settings.financialYearStart);

    if (now >= fyStart) {
      financialYear = `${fyStart.getFullYear()}-${(
        fyStart.getFullYear() + 1
      )
        .toString()
        .slice(-2)}`;
    } else {
      financialYear = `${fyStart.getFullYear() - 1}-${fyStart
        .getFullYear()
        .toString()
        .slice(-2)}`;
    }
  } else {
    financialYear = settings.manualFinancialYear || "";
  }

  const sequence = String(settings.currentSequenceNo).padStart(
    settings.invoiceSequenceLength,
    "0"
  );
  let invoiceNumber = settings.invoiceFormat
    .replace("{PREFIX}", settings.invoicePrefix)
    .replace("{FY}", financialYear)
    .replace("{SEQ}", sequence);

  // Update sequence number for next invoice
  await tx.invoiceSettings.update({
    where: { id: settings.id },
    data: { currentSequenceNo: settings.currentSequenceNo + 1 },
  });

  return invoiceNumber;
};

module.exports = {
  generateInvoiceNumber,
};
