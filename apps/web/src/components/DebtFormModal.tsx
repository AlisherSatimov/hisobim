import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDebtSchema, useCreateDebt, useAuthStore, formatAmount } from '@hisobim/shared';

type EntryType = 'debt' | 'payment';
type FormData = { amount: string; description?: string };

/**
 * Yozuv qo'shish. Mobil bilan bir xil kelishuv: qarz musbat summa,
 * to'lov manfiy summa sifatida saqlanadi.
 */
export default function DebtFormModal({
  shopId,
  customerId,
  onClose,
}: {
  shopId: string;
  customerId: string;
  onClose: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const createDebt = useCreateDebt(customerId, user?.id ?? '');
  const [entryType, setEntryType] = useState<EntryType>('debt');
  const [errorMsg, setErrorMsg] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(addDebtSchema),
    defaultValues: { amount: '', description: '' },
  });

  const rawAmount = watch('amount');
  const parsed = Number(rawAmount);
  const preview =
    rawAmount && !isNaN(parsed) && parsed > 0
      ? formatAmount(entryType === 'payment' ? -parsed : parsed)
      : '';

  const onSubmit = async ({ amount, description }: FormData) => {
    setErrorMsg('');
    const numeric = Number(amount);
    try {
      await createDebt.mutateAsync({
        shop_id: shopId,
        customer_id: customerId,
        amount: entryType === 'payment' ? -numeric : numeric,
        description: description?.trim() || null,
      });
      onClose();
    } catch {
      setErrorMsg("Yozuvni saqlab bo'lmadi. Ulanishni tekshirib, qayta urining.");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Yozuv qo'shish</h2>

        <div className="toolbar">
          <button
            type="button"
            className={`btn ${entryType === 'debt' ? '' : 'secondary'}`}
            onClick={() => setEntryType('debt')}
          >
            Qarz qildi
          </button>
          <button
            type="button"
            className={`btn ${entryType === 'payment' ? '' : 'secondary'}`}
            onClick={() => setEntryType('payment')}
          >
            To'lov qildi
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field">
            <label htmlFor="amount">Summa (so'm)</label>
            <input
              id="amount"
              inputMode="numeric"
              className={`input${errors.amount ? ' invalid' : ''}`}
              {...register('amount')}
            />
            {errors.amount ? <div className="input-error">{errors.amount.message}</div> : null}
            {preview ? (
              <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                Yoziladi: {preview}
              </div>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="description">Izoh (ixtiyoriy)</label>
            <input
              id="description"
              className={`input${errors.description ? ' invalid' : ''}`}
              {...register('description')}
            />
            {errors.description ? (
              <div className="input-error">{errors.description.message}</div>
            ) : null}
          </div>

          {errorMsg ? <div className="form-error">{errorMsg}</div> : null}

          <div className="modal-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={onClose}
              disabled={createDebt.isPending}
            >
              Bekor qilish
            </button>
            <button type="submit" className="btn" disabled={createDebt.isPending}>
              {createDebt.isPending ? 'Saqlanmoqda…' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
