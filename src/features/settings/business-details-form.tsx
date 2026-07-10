import { updateBusinessProfile } from "@/app/settings/business/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BusinessDetails = {
  name: string;
  trading_name: string | null;
  company_registration_number: string | null;
  vat_registration_number: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  town: string | null;
  county: string | null;
  postcode: string | null;
  country: string | null;
  short_company_description: string | null;
  about_business: string | null;
  public_contact_email: string | null;
  public_contact_phone: string | null;
};

type BusinessDetailsFormProps = {
  business: BusinessDetails;
  canEdit: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-md border bg-background p-4">
      <h2 className="text-lg font-semibold tracking-normal">{title}</h2>
      {children}
    </section>
  );
}

export function BusinessDetailsForm({
  business,
  canEdit,
  errorMessage,
  successMessage,
}: BusinessDetailsFormProps) {
  return (
    <form action={updateBusinessProfile} className="space-y-5">
      {errorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      {!canEdit ? (
        <div className="rounded-md border bg-muted px-4 py-3 text-sm text-muted-foreground">
          Only owners can update the business profile.
        </div>
      ) : null}

      <Section title="Business">
        <div className="space-y-2">
          <Label htmlFor="business-name">Business name</Label>
          <Input
            id="business-name"
            name="name"
            defaultValue={business.name}
            disabled={!canEdit}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="trading-name">Trading name</Label>
            <Input
              id="trading-name"
              name="tradingName"
              defaultValue={business.trading_name ?? ""}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              defaultValue={business.website ?? ""}
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company-registration-number">
              Company registration number
            </Label>
            <Input
              id="company-registration-number"
              name="companyRegistrationNumber"
              defaultValue={business.company_registration_number ?? ""}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vat-registration-number">VAT registration number</Label>
            <Input
              id="vat-registration-number"
              name="vatRegistrationNumber"
              defaultValue={business.vat_registration_number ?? ""}
              disabled={!canEdit}
            />
          </div>
        </div>
      </Section>

      <Section title="Contact">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={business.email ?? ""}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telephone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={business.phone ?? ""}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile</Label>
            <Input
              id="mobile"
              name="mobile"
              type="tel"
              autoComplete="tel"
              defaultValue={business.mobile ?? ""}
              disabled={!canEdit}
            />
          </div>
        </div>
      </Section>

      <Section title="Address">
        <div className="space-y-2">
          <Label htmlFor="address-line-1">Address line 1</Label>
          <Input
            id="address-line-1"
            name="addressLine1"
            autoComplete="address-line1"
            defaultValue={business.address_line_1 ?? ""}
            disabled={!canEdit}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address-line-2">Address line 2</Label>
          <Input
            id="address-line-2"
            name="addressLine2"
            autoComplete="address-line2"
            defaultValue={business.address_line_2 ?? ""}
            disabled={!canEdit}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="town">Town / City</Label>
            <Input
              id="town"
              name="town"
              autoComplete="address-level2"
              defaultValue={business.town ?? ""}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="county">County</Label>
            <Input
              id="county"
              name="county"
              autoComplete="address-level1"
              defaultValue={business.county ?? ""}
              disabled={!canEdit}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="postcode">Postcode</Label>
            <Input
              id="postcode"
              name="postcode"
              autoComplete="postal-code"
              defaultValue={business.postcode ?? ""}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              autoComplete="country-name"
              defaultValue={business.country ?? "United Kingdom"}
              disabled={!canEdit}
            />
          </div>
        </div>
      </Section>

      <Section title="Business Identity">
        <div className="space-y-2">
          <Label htmlFor="short-company-description">Short company description</Label>
          <Input
            id="short-company-description"
            name="shortCompanyDescription"
            defaultValue={business.short_company_description ?? ""}
            disabled={!canEdit}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="about-business">About the business</Label>
          <textarea
            id="about-business"
            name="aboutBusiness"
            defaultValue={business.about_business ?? ""}
            disabled={!canEdit}
            className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="public-contact-email">Public contact email</Label>
            <Input
              id="public-contact-email"
              name="publicContactEmail"
              type="email"
              defaultValue={business.public_contact_email ?? ""}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="public-contact-phone">Public contact phone</Label>
            <Input
              id="public-contact-phone"
              name="publicContactPhone"
              type="tel"
              defaultValue={business.public_contact_phone ?? ""}
              disabled={!canEdit}
            />
          </div>
        </div>
      </Section>

      {canEdit ? <Button type="submit">Save business profile</Button> : null}
    </form>
  );
}
