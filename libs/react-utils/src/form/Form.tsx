import { DetailedHTMLProps, FormHTMLAttributes, forwardRef, PropsWithChildren, Ref, useEffect, useImperativeHandle, useRef } from 'react';
import { DefaultValues, FormProvider, useForm, useWatch } from 'react-hook-form';
import { noop } from '@thalesrc/js-utils/function/noop';
import { usePrevious } from '@thalesrc/react-utils';
import { difference } from '@thalesrc/js-utils/array/difference';

type FormAttributes = Omit<DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, 'onChange' | 'onSubmit'>;

export interface FormRef {
  setValue<T>(name: string, value: T): void;
}

export interface FormProps<T extends Record<string, unknown>> extends FormAttributes {
  onSubmit?(data: T): void;
  onChange?(data: T): void;
  defaultValues?: DefaultValues<T>;
}

function isSameValue(a: unknown, b: unknown): boolean {
  if (a instanceof Array && b instanceof Array) {
    return !difference(a, b).length && !difference(b, a).length;
  }

  if (typeof a === 'object' && typeof b === 'object') {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  return a === b;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export default function Form<T extends {}>({
  onSubmit = noop,
  onChange = noop,
  defaultValues,
  children,
  ...attributes
}: PropsWithChildren<FormProps<T>>, ref: Ref<FormRef>) {
  const methods = useForm<T>({ mode: 'all', defaultValues });
  const values = useWatch({ control: methods.control });
  const prevValues = usePrevious(values);
  const dummyRef = useRef<FormRef>(null);

  useEffect(() => {
    // Override values
    const values = methods.getValues();

    if (values === prevValues) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (Object.keys(values).every(key => isSameValue((values as any)[key], (prevValues as any)?.[key]))) return;

    onChange(values as T);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, prevValues, onChange, methods.getValues]);

  useImperativeHandle('current' in ref! ? ref : dummyRef, () => ({
    setValue: methods.setValue,
  }), [methods]);

  return (
    <FormProvider<T> {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} {...attributes}>
        {children}
      </form>
    </FormProvider>
  );
}

export const FormForwarded = forwardRef(Form);
