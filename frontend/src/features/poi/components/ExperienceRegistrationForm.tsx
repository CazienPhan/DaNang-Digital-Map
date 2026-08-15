import React, { useState, useCallback } from 'react';
import { X, User, Phone, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ExperienceRegistrationFormProps {
  /** Called when the user closes the form. Returns to POI detail context. */
  onClose: () => void;
}

/** Shape of the registration form values. */
interface FormValues {
  hoTen: string;
  soDienThoai: string;
  ngayTraiNghiem: string;
  khungGio: string;
  soNguoi: string;
  doiTuong: string; // optional — selected participant type
  ghiChu: string;  // optional
}

/** Which required fields have been "touched" by the submit attempt. */
interface FormErrors {
  hoTen?: string;
  soDienThoai?: string;
  ngayTraiNghiem?: string;
  khungGio?: string;
  soNguoi?: string;
}

/** Participant type option. */
const PARTICIPANT_TYPES = [
  'Cá nhân',
  'Gia đình',
  'Công ty',
  'Đoàn khách du lịch',
  'Trường học',
] as const;

/** Exact validation message required by spec. */
const REQUIRED_MSG = '*Trường thông tin không được để trống.';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: validate all required fields and return field-level errors.
// ─────────────────────────────────────────────────────────────────────────────
function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.hoTen.trim()) errors.hoTen = REQUIRED_MSG;
  if (!values.soDienThoai.trim()) errors.soDienThoai = REQUIRED_MSG;
  if (!values.ngayTraiNghiem.trim()) errors.ngayTraiNghiem = REQUIRED_MSG;
  if (!values.khungGio.trim()) errors.khungGio = REQUIRED_MSG;
  if (!values.soNguoi.trim()) errors.soNguoi = REQUIRED_MSG;

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: FormField — wraps label + input + error message
// ─────────────────────────────────────────────────────────────────────────────

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  icon: React.ReactNode;
  errorIcon: React.ReactNode;
  children: (hasError: boolean) => React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required = false,
  error,
  children,
}) => {
  const hasError = Boolean(error);

  return (
    <div className="exp-form__field">
      {/* Label */}
      <label
        htmlFor={id}
        className="exp-form__label"
      >
        {label}
        {required && <span className="exp-form__required-star" aria-hidden="true"> *</span>}
      </label>

      {/* Input slot — rendered by parent via render-prop */}
      {children(hasError)}

      {/* Field-specific validation message */}
      {hasError && (
        <p
          id={`${id}-error`}
          className="exp-form__error-msg"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const ExperienceRegistrationForm: React.FC<ExperienceRegistrationFormProps> = ({
  onClose,
}) => {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [values, setValues] = useState<FormValues>({
    hoTen: '',
    soDienThoai: '',
    ngayTraiNghiem: '',
    khungGio: '',
    soNguoi: '',
    doiTuong: '',
    ghiChu: '',
  });

  // Errors are only shown AFTER the first submit attempt.
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // ── Field change handler ────────────────────────────────────────────────────
  const handleChange = useCallback(
    (field: keyof FormValues) => (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const newVal = e.target.value;
      setValues((prev) => ({ ...prev, [field]: newVal }));

      // If user already attempted submit, re-validate on change so errors clear dynamically.
      if (hasAttemptedSubmit) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          // Clear error for this field if now non-empty
          if (field in newErrors) {
            if (newVal.trim()) {
              delete (newErrors as any)[field];
            } else {
              (newErrors as any)[field] = REQUIRED_MSG;
            }
          }
          return newErrors;
        });
      }
    },
    [hasAttemptedSubmit]
  );

  // ── Participant type selection ──────────────────────────────────────────────
  const handleParticipantType = useCallback((type: string) => {
    setValues((prev) => ({
      ...prev,
      doiTuong: prev.doiTuong === type ? '' : type, // toggle
    }));
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    setHasAttemptedSubmit(true);
    const newErrors = validateForm(values);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      // Validation failed — errors are shown field-by-field.
      return;
    }

    // All required fields are valid. No registration service currently exists
    // in this codebase. This is a UI entry-point only — it does NOT fabricate
    // a fake registration. When a real registration flow is implemented, wire
    // this handler to the real service/API.
    console.warn(
      '[ExperienceRegistrationForm] Registration service not yet implemented. ' +
      'Form values:', values,
      'Connect this handler to the real registration API/service when available.'
    );
  }, [values]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="exp-form__root flex flex-col h-full bg-background text-foreground">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="exp-form__header shrink-0 flex items-center justify-between px-5 py-2"
        style={{ backgroundColor: '#fd9401' }}
      >
        <h2
          id="exp-form-title"
          className="text-base font-bold text-white tracking-normal leading-snug"
        >
          Đăng ký trải nghiệm OCOP
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-black hover:bg-white/20 hover:text-white rounded-full shrink-0"
          aria-label="Đóng form đăng ký trải nghiệm"
          title="Đóng"
        >
          <X size={17} />
        </Button>
      </div>

      {/* ── Scrollable Form Body ────────────────────────────────────────────── */}
      <div className="exp-form__body flex-1 overflow-y-auto px-5 py-4 space-y-4">

        {/* ── Họ và tên * ─────────────────────────────────────────────────── */}
        <FormField
          id="exp-ho-ten"
          label="Họ và tên"
          required
          error={errors.hoTen}
          icon={<User size={16} />}
          errorIcon={<User size={16} />}
        >
          {(hasError) => (
            <div
              className={cn(
                'exp-form__input-wrapper',
                hasError && 'exp-form__input-wrapper--error'
              )}
            >
              <User
                size={16}
                className={cn(
                  'exp-form__input-icon',
                  hasError && 'exp-form__input-icon--error'
                )}
                aria-hidden="true"
              />
              <input
                id="exp-ho-ten"
                type="text"
                className="exp-form__input"
                placeholder="Nhập họ và tên"
                value={values.hoTen}
                onChange={handleChange('hoTen')}
                aria-required="true"
                aria-invalid={hasError ? 'true' : 'false'}
                aria-describedby={hasError ? 'exp-ho-ten-error' : undefined}
                autoComplete="name"
              />
            </div>
          )}
        </FormField>

        {/* ── Số điện thoại * ─────────────────────────────────────────────── */}
        <FormField
          id="exp-so-dien-thoai"
          label="Số điện thoại"
          required
          error={errors.soDienThoai}
          icon={<Phone size={16} />}
          errorIcon={<Phone size={16} />}
        >
          {(hasError) => (
            <div
              className={cn(
                'exp-form__input-wrapper',
                hasError && 'exp-form__input-wrapper--error'
              )}
            >
              <Phone
                size={16}
                className={cn(
                  'exp-form__input-icon',
                  hasError && 'exp-form__input-icon--error'
                )}
                aria-hidden="true"
              />
              <input
                id="exp-so-dien-thoai"
                type="tel"
                className="exp-form__input"
                placeholder="Nhập số điện thoại"
                value={values.soDienThoai}
                onChange={handleChange('soDienThoai')}
                aria-required="true"
                aria-invalid={hasError ? 'true' : 'false'}
                aria-describedby={hasError ? 'exp-so-dien-thoai-error' : undefined}
                autoComplete="tel"
                inputMode="tel"
              />
            </div>
          )}
        </FormField>

        {/* ── Ngày trải nghiệm * ──────────────────────────────────────────── */}
        <FormField
          id="exp-ngay"
          label="Ngày trải nghiệm"
          required
          error={errors.ngayTraiNghiem}
          icon={<Calendar size={16} />}
          errorIcon={<Calendar size={16} />}
        >
          {(hasError) => (
            <div
              className={cn(
                'exp-form__input-wrapper',
                hasError && 'exp-form__input-wrapper--error'
              )}
            >
              <Calendar
                size={16}
                className={cn(
                  'exp-form__input-icon',
                  hasError && 'exp-form__input-icon--error'
                )}
                aria-hidden="true"
              />
              <input
                id="exp-ngay"
                type="date"
                className="exp-form__input exp-form__input--date"
                value={values.ngayTraiNghiem}
                onChange={handleChange('ngayTraiNghiem')}
                aria-required="true"
                aria-invalid={hasError ? 'true' : 'false'}
                aria-describedby={hasError ? 'exp-ngay-error' : undefined}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}
        </FormField>

        {/* ── Khung giờ trải nghiệm * ─────────────────────────────────────── */}
        <FormField
          id="exp-khung-gio"
          label="Khung giờ trải nghiệm"
          required
          error={errors.khungGio}
          icon={<Clock size={16} />}
          errorIcon={<Clock size={16} />}
        >
          {(hasError) => (
            <div
              className={cn(
                'exp-form__input-wrapper',
                hasError && 'exp-form__input-wrapper--error'
              )}
            >
              <Clock
                size={16}
                className={cn(
                  'exp-form__input-icon',
                  hasError && 'exp-form__input-icon--error'
                )}
                aria-hidden="true"
              />
              <input
                id="exp-khung-gio"
                type="time"
                className="exp-form__input exp-form__input--date"
                value={values.khungGio}
                onChange={handleChange('khungGio')}
                aria-required="true"
                aria-invalid={hasError ? 'true' : 'false'}
                aria-describedby={hasError ? 'exp-khung-gio-error' : undefined}
              />
            </div>
          )}
        </FormField>

        {/* ── Số người tham gia * ─────────────────────────────────────────── */}
        <FormField
          id="exp-so-nguoi"
          label="Số người tham gia"
          required
          error={errors.soNguoi}
          icon={<Users size={16} />}
          errorIcon={<Users size={16} />}
        >
          {(hasError) => (
            <div
              className={cn(
                'exp-form__input-wrapper',
                hasError && 'exp-form__input-wrapper--error'
              )}
            >
              <Users
                size={16}
                className={cn(
                  'exp-form__input-icon',
                  hasError && 'exp-form__input-icon--error'
                )}
                aria-hidden="true"
              />
              <input
                id="exp-so-nguoi"
                type="number"
                className="exp-form__input"
                placeholder="Nhập số người"
                min="1"
                value={values.soNguoi}
                onChange={handleChange('soNguoi')}
                aria-required="true"
                aria-invalid={hasError ? 'true' : 'false'}
                aria-describedby={hasError ? 'exp-so-nguoi-error' : undefined}
                inputMode="numeric"
              />
            </div>
          )}
        </FormField>

        {/* ── Đối tượng tham gia (optional) ───────────────────────────────── */}
        <div className="exp-form__field">
          <p className="exp-form__label" id="exp-doi-tuong-label">
            Đối tượng tham gia
          </p>
          <div
            className="exp-form__participant-group"
            role="group"
            aria-labelledby="exp-doi-tuong-label"
          >
            {PARTICIPANT_TYPES.map((type) => {
              const isSelected = values.doiTuong === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleParticipantType(type)}
                  className={cn(
                    'exp-form__participant-btn',
                    isSelected && 'exp-form__participant-btn--selected'
                  )}
                  aria-pressed={isSelected}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Ghi chú (optional) ──────────────────────────────────────────── */}
        <div className="exp-form__field">
          <label htmlFor="exp-ghi-chu" className="exp-form__label">
            Ghi chú
          </label>
          <textarea
            id="exp-ghi-chu"
            className="exp-form__textarea"
            placeholder="Nhập ghi chú (nếu có)"
            rows={3}
            value={values.ghiChu}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, ghiChu: e.target.value }))
            }
            aria-required="false"
          />
        </div>

      </div>

      {/* ── Footer — Submit button ──────────────────────────────────────────── */}
      <div className="exp-form__footer shrink-0 border-t border-border/50 px-5 py-4">
        <Button
          id="exp-submit-btn"
          onClick={handleSubmit}
          className="w-full font-semibold h-11 text-sm rounded-xl"
          style={{ backgroundColor: '#fd9401' }}
          aria-label="Đăng ký tham gia trải nghiệm OCOP"
        >
          Đăng ký tham gia
        </Button>
      </div>

    </div>
  );
};

export default ExperienceRegistrationForm;
