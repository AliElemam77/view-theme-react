import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

export interface DigitalFilesSettingsProps {
  /** Number of digital files included */
  count?: number;
  /** Allowed file formats (array or comma-separated string) */
  formats?: string | string[];
  /** Download expiration period */
  download_period?: string;
  /** Whether customer has access to future files */
  access_new_files?: boolean;
}

export function DigitalFilesSettings({
  count,
  formats,
  download_period,
  access_new_files,
}: DigitalFilesSettingsProps) {
  const { t } = useTranslation();

  // Return null if no settings provided
  const hasSettings = count || formats || download_period || access_new_files;
  if (!hasSettings) {
    return null;
  }

  const formatsDisplay = Array.isArray(formats) ? formats.join(', ') : formats || '-';

  return (
    <section className="bg-primary-reverse border border-lightgray p-5 rounded-theme mb-5 last:mb-0">
      <ul className="space-y-4">
        <li className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-mediumgray">
            <i className="sicon-page" aria-hidden="true" />
            <div className="text-mediumgray text-sm">
              {t('pages.products.number_of_files', 'Number of Files')}
            </div>
          </div>
          <div className="text-darkgray font-medium">{count || '-'}</div>
        </li>

        <li className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-mediumgray">
            <i className="sicon-file-archive" aria-hidden="true" />
            <div className="text-mediumgray text-sm">
              {t('pages.products.file_formats', 'File Formats')}
            </div>
          </div>
          <div className="text-darkgray font-medium text-sm">{formatsDisplay}</div>
        </li>

        <li className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-mediumgray">
            <i className="sicon-calendar" aria-hidden="true" />
            <div className="text-mediumgray text-sm">
              {t('pages.products.file_expiration_period', 'File Expiration Period')}
            </div>
          </div>
          <div className="text-darkgray font-medium text-sm">{download_period || '-'}</div>
        </li>

        {access_new_files && (
          <li className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-mediumgray">
              <i className="sicon-rotate" aria-hidden="true" />
              <div className="text-mediumgray text-sm">
                {t('pages.products.free_access_to_new_files', 'Free Access to New Files')}
              </div>
            </div>
            <div className="text-darkgray text-sm">
              <i className="sicon-check-circle text-lg" aria-hidden="true" />
            </div>
          </li>
        )}
      </ul>
    </section>
  );
}
