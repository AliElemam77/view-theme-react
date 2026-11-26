import { useEffect, useState, type FormEvent } from 'react';
import { SallaButton } from '@salla.sa/twilight-components-react/button';
import { SallaDatetimePicker } from '@salla.sa/twilight-components-react/datetime-picker';
import { SallaFileUpload } from '@salla.sa/twilight-components-react/file-upload';
import { SallaTelInput } from '@salla.sa/twilight-components-react/tel-input';
import { SallaUserSettings } from '@salla.sa/twilight-components-react/user-settings';
import { SallaVerify } from '@salla.sa/twilight-components-react/verify';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { useUser } from '@salla.sa/twilight-theme-engine/hooks/useUser';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { ProfilePageProps } from '@salla.sa/twilight-theme-engine/routes/account';

/** A profile custom field, as Twig's `custom_fields` and `salla.api.profile.getFields()` give it. */
interface ProfileCustomField {
  id: number | string;
  label?: string;
  type?: string;
  value?: string;
  required?: boolean;
}

/** The SDK members this page calls that the engine's `window.salla` typings leave out. */
interface SallaProfileSdk {
  api?: { profile?: { getFields?: () => Promise<ProfileCustomField[] | null | undefined> } };
  form?: { submit?: (action: string, event: Event) => Promise<unknown> };
}

const sdk = () => window.salla as unknown as SallaProfileSdk | undefined;

const LABEL = 'block text-sm font-bold mb-2 text-darkgray';

/** Twig's `custom_fields`, which the server rendered into the page; React reads them from the SDK. */
function useProfileCustomFields() {
  const [fields, setFields] = useState<ProfileCustomField[]>([]);
  useEffect(() => {
    let cancelled = false;
    void window.salla
      ?.onReady()
      .then(() => sdk()?.api?.profile?.getFields?.())
      .then((result) => {
        if (!cancelled && Array.isArray(result)) setFields(result);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  return fields;
}

/** Twig's `store.url|trim('/'~user.language_code) ~ '/upload-image'`. */
function uploadImageUrl(storeUrl: string | undefined, locale: string) {
  const base = (storeUrl ?? '').replace(/\/+$/, '').replace(new RegExp(`/${locale}$`), '');
  return `${base}/upload-image`;
}

function CustomFieldInput({ field, uploadUrl }: { field: ProfileCustomField; uploadUrl: string }) {
  const { t } = useTranslation();
  const name = `custom_fields[${field.id}]`;
  if (field.type === 'photo') {
    return (
      <>
        <SallaFileUpload
          instantUpload
          value={field.value}
          url={uploadUrl}
          name={name}
          payloadName="image"
          height="120px"
        >
          <div className="profile-filepond-placholder">
            <span className="profile-filepond-placholder-icon">
              <i className="sicon-camera"></i>
            </span>
            <p className="profile-filepond-placholder-text">{t('common.uploader.drag_and_drop')}</p>
            <span className="filepond--label-action">{t('common.uploader.browse')}</span>
          </div>
        </SallaFileUpload>
        <input type="hidden" name={name} defaultValue={field.value} />
      </>
    );
  }
  return (
    <input
      type={field.type}
      id={String(field.id)}
      defaultValue={field.value}
      name={name}
      className="form-input"
      required={!!field.required}
    />
  );
}

/**
 * Theme fork of the engine `ProfilePage` (rendered by `app/routes/account.profile.tsx`): View's
 * `pages/customer/profile.twig` form (two-column `form--user-profile` grid, bold labels,
 * `form-input`s, photo custom fields, full-width save button) instead of `<salla-user-profile>`.
 * It submits like Twig, through `salla.form.onSubmit('profile.update', event)`, which serialises
 * the form (custom fields included) and calls `salla.profile.update`.
 */
export function ProfilePage(_props: ProfilePageProps) {
  const { t, locale } = useTranslation();
  const { store } = useTwilight();
  const { data: user } = useUser();
  const customFields = useProfileCustomFields();
  const [saving, setSaving] = useState(false);

  // The layout's avatar uploader (engine `CustomerLayout`) has no slot for Twig's
  // "choose a suitable picture" line; `.avatar-placeholder::after` (user-pages.scss) prints it.
  const avatarText = t('common.uploader.choose_suitable_picture');
  const avatarCss =
    avatarText && avatarText !== 'common.uploader.choose_suitable_picture'
      ? `:root{--avatar-placeholder-text:${JSON.stringify(avatarText.replace(/[<>\\]/g, ''))}}`
      : '';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const native = event.nativeEvent;
    const submit = sdk()?.form?.submit;
    if (!submit) {
      window.salla?.form.onSubmit('profile.update', native);
      return;
    }
    setSaving(true);
    void submit('profile.update', native)
      .catch(() => undefined)
      .finally(() => setSaving(false));
  };

  const uploadUrl = uploadImageUrl(store?.url, locale);

  return (
    <>
      {avatarCss && <style>{avatarCss}</style>}

      <HookSlot name="customer:profile.start" />

      <HookSlot name="customer:profile.form.start" />
      {/* Uncontrolled like Twig's server-filled inputs: remount once the user has loaded. */}
      <form
        key={user?.id ?? 'loading'}
        className="form form--user-profile ajax"
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <HookSlot name="customer:profile.form.fields.start" />

          <div className="profile-field-item">
            <label htmlFor="first-name" className={LABEL}>
              {t('pages.profile.first_name')}
            </label>
            <input
              data-testid="store-profile-first-name"
              type="text"
              name="first_name"
              defaultValue={user?.first_name}
              id="first-name"
              required
              autoComplete="first_name"
              className="form-input"
            />
          </div>

          <div className="profile-field-item">
            <label htmlFor="last-name" className={LABEL}>
              {t('pages.profile.last_name')}
            </label>
            <input
              data-testid="store-profile-last-name"
              type="text"
              name="last_name"
              defaultValue={user?.last_name}
              id="last-name"
              autoComplete="last-name"
              required
              className="form-input"
            />
          </div>

          <div className="profile-field-item">
            <label htmlFor="birthday" className={LABEL}>
              {t('pages.profile.birthday')}
            </label>
            <SallaDatetimePicker
              data-testid="store-profile-birthday"
              dateFormat="Y-m-d"
              value={user?.birthday ?? undefined}
              placeholder={t('pages.profile.birthday_placeholder')}
              required
              name="birthday"
            />
          </div>

          <div className="profile-field-item">
            <label htmlFor="gender" className={LABEL}>
              {t('pages.profile.gender')}
            </label>
            <select
              data-testid="store-profile-gender"
              className="form-input"
              name="gender"
              id="gender"
              required
              defaultValue={user?.gender === 'male' || user?.gender === 'female' ? user.gender : ''}
            >
              <option value="">{t('pages.profile.gender_placeholder')}</option>
              <option value="male">{t('pages.profile.male')}</option>
              <option value="female">{t('pages.profile.female')}</option>
            </select>
          </div>

          <div className="profile-field-item">
            <label htmlFor="email" className={LABEL}>
              {t('common.elements.email')}
            </label>
            <input
              data-testid="store-profile-email"
              type="email"
              name="email"
              defaultValue={user?.email}
              id="email"
              className="form-input"
              required
            />
          </div>

          <div className="profile-field-item">
            <label htmlFor="international-mobile" className={LABEL}>
              {t('common.elements.mobile')}
            </label>
            <SallaTelInput
              data-testid="store-profile-phone"
              phone={user?.mobile}
              countryCode={user?.country_code}
            />
          </div>

          {customFields.map((field) => (
            <div className="profile-field-item" key={field.id}>
              <label htmlFor={String(field.id)} className={LABEL}>
                {field.label}
              </label>
              <CustomFieldInput field={field} uploadUrl={uploadUrl} />
            </div>
          ))}

          <HookSlot name="customer:profile.form.fields.end" />
        </div>

        <HookSlot name="customer:profile.form.submit.start" />

        <SallaButton
          data-testid="store-profile-submit"
          type="submit"
          loaderPosition="end"
          loading={saving}
          disabled={saving}
          className="w-full mt-6"
        >
          {t('common.elements.save')}
        </SallaButton>

        <HookSlot name="customer:profile.form.submit.end" />
      </form>
      <HookSlot name="customer:profile.form.end" />

      <SallaVerify data-testid="store-profile-verify" />

      <SallaUserSettings
        data-testid="store-profile-settings"
        {...(user?.preferences?.notifications_enabled ? { isNotifiable: true } : {})}
        className="mt-10 block"
      />

      <HookSlot name="customer:profile.end" />
    </>
  );
}
