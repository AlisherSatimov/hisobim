import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  addCustomerSchema,
  useCreateCustomer,
  useUpdateCustomer,
  type Customer,
} from '@hisobim/shared';

type FormData = { name: string; phone?: string; note?: string };

/**
 * Mijoz qo'shish va tahrirlash bitta forma — maydonlari bir xil, farqi
 * faqat qaysi mutatsiya chaqirilishida.
 */
export default function CustomerFormModal({
  shopId,
  customer,
  onClose,
}: {
  shopId: string;
  customer: Customer | null;
  onClose: () => void;
}) {
  const isEdit = !!customer;
  const [errorMsg, setErrorMsg] = useState('');

  const createCustomer = useCreateCustomer(shopId);
  const updateCustomer = useUpdateCustomer(shopId, customer?.id ?? '');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(addCustomerSchema),
    defaultValues: {
      name: customer?.name ?? '',
      phone: customer?.phone ?? '',
      note: customer?.note ?? '',
    },
  });

  const isSaving = createCustomer.isPending || updateCustomer.isPending;

  const onSubmit = async (values: FormData) => {
    setErrorMsg('');
    const payload = {
      name: values.name.trim(),
      phone: values.phone?.trim() || null,
      note: values.note?.trim() || null,
    };

    try {
      if (isEdit) {
        await updateCustomer.mutateAsync(payload);
      } else {
        await createCustomer.mutateAsync({ shop_id: shopId, ...payload });
      }
      onClose();
    } catch {
      setErrorMsg("Saqlab bo'lmadi. Ulanishni tekshirib, qayta urining.");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? 'Mijozni tahrirlash' : "Mijoz qo'shish"}</h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field">
            <label htmlFor="name">Ism</label>
            <input
              id="name"
              className={`input${errors.name ? ' invalid' : ''}`}
              {...register('name')}
            />
            {errors.name ? <div className="input-error">{errors.name.message}</div> : null}
          </div>

          <div className="field">
            <label htmlFor="phone">Telefon (ixtiyoriy)</label>
            <input
              id="phone"
              placeholder="90 123 45 67"
              className={`input${errors.phone ? ' invalid' : ''}`}
              {...register('phone')}
            />
            {errors.phone ? <div className="input-error">{errors.phone.message}</div> : null}
          </div>

          <div className="field">
            <label htmlFor="note">Izoh (ixtiyoriy)</label>
            <input
              id="note"
              className={`input${errors.note ? ' invalid' : ''}`}
              {...register('note')}
            />
            {errors.note ? <div className="input-error">{errors.note.message}</div> : null}
          </div>

          {errorMsg ? <div className="form-error">{errorMsg}</div> : null}

          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose} disabled={isSaving}>
              Bekor qilish
            </button>
            <button type="submit" className="btn" disabled={isSaving}>
              {isSaving ? 'Saqlanmoqda…' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
