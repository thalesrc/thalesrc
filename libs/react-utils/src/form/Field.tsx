import { Controller, ControllerProps, useForm, useFormContext } from "react-hook-form";
import { useUniqueId } from "@thalesrc/react-utils/hooks/unique-id.hook";

type Rules = ControllerProps['rules'];
type PredefinedRules = 'email' | 'required';

interface FieldProps<T = unknown> {
  name?: string;
  defaultValue?: T;
  render: ControllerProps["render"];
  rules?: PredefinedRules | PredefinedRules[] | (Rules & { extend?: PredefinedRules[] });
  required?: boolean;
}

export default function Field<T = unknown>({ name, render, rules, required, defaultValue }: FieldProps<T>) {
  const { control } = useFormContext();
  const { control: defaultControl } = useForm();
  const uniqueName = useUniqueId('field-');
  let parsedRules: Rules = {};

  if (required) {
    parsedRules.required = true;
  }

  if (typeof rules === 'string') {
    parsedRules = applyRule(rules, parsedRules);
  } else if (Array.isArray(rules)) {
    parsedRules = rules.reduce((acc, rule) => applyRule(rule, acc)!, parsedRules);
  } else if (rules?.extend) {
    parsedRules = rules.extend.reduce((acc, rule) => applyRule(rule, acc)!, { ...rules, ...parsedRules });
  }

  return <Controller
    name={name ?? uniqueName}
    control={control ?? defaultControl}
    rules={parsedRules}
    render={render}
    defaultValue={defaultValue}
  />;
}

function applyRule(type: PredefinedRules, rules: Rules): Rules {
  switch (type) {
    case 'email':
      return {
        ...rules,
        validate: {
          ...rules?.validate ?? {},
          email: (value) => /^\S+@\S+\.\S+$/.test(value) || 'Invalid email address',
        },
      };
    case 'required':
      return {
        ...rules,
        required: true
      };
  }
}
