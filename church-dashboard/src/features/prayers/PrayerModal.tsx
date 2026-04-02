import { useState } from "react";
import type {
  CreatePrayerRequestInput,
  PrayerCategory,
} from "../../types/church.types";

type PrayerModalProps = {
  onClose: () => void;
  onSave: (data: CreatePrayerRequestInput) => void;
};
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  FormGroup,
  Stack,
  TextArea,
  TextInput,
} from "@carbon/react";

const CATEGORIES: PrayerCategory[] = [
  "Health",
  "Family",
  "Financial",
  "Spiritual Growth",
  "Bereavement",
  "Thanks Giving",
  "Other",
] ;

const DEFAULT_FORM = {
  name: "",
  request: "",
  category: "Health" as PrayerCategory,
  isPrivate: false,
};

export const PrayerModal = ({ onClose, onSave }: PrayerModalProps) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  //if (!visible) return null;

  const changeHandler = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  //check box handled from here
  const checkboxHandler = (
    _e: React.ChangeEvent<HTMLInputElement>,
    { checked }: { checked: boolean },
  ) => {
    setForm((prev) => ({ ...prev, isPrivate: checked }));
  };

  //form submiting is handled from here;
  const saveForm = () => {
    onSave({
      name: form.name,
      category: form.category,
      request: form.request,
      isPrivate: form.isPrivate,
      status: "Pending",
      prayerCount: 0,
      createdAt: new Date().toISOString(),
    });
    setForm(DEFAULT_FORM);
    onClose();
  };

  const formSubmitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    saveForm();
  };
  return (
    <Form onSubmit={formSubmitHandler} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Stack gap={6} style={{ flex: 1, paddingBottom: '2rem' }}>
        <TextInput
          id="name"
          name="name"
          labelText="Full Name"
          value={form.name}
          onChange={changeHandler}
          required
        />

        <Dropdown
          id="category"
          titleText="Prayer Request Category"
          label="Select a category"
          items={CATEGORIES}
          itemToString={(item) => item ?? ""}
          selectedItem={form.category}
          onChange={({ selectedItem }) =>
            setForm((prev) => ({
              ...prev,
              category: selectedItem ?? "Health",
            }))
          }
        />

        <TextArea
          id="request"
          name="request"
          labelText="Your Prayer Request"
          value={form.request}
          onChange={changeHandler}
          required
          placeholder="What would you like to be prayed for"
          maxLength={500}
          rows={7}
        />

        <FormGroup legendText="Privacy">
          <Checkbox
            id="isPrivate"
            labelText="Keep this request Private to church Leaders"
            checked={form.isPrivate}
            onChange={checkboxHandler}
          />
        </FormGroup>
      </Stack>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--cds-border-subtle)' }}>
        <Button kind="secondary" onClick={onClose} style={{ flex: 1 }}>
          Cancel
        </Button>
        <Button
          kind="primary"
          type="submit"
          disabled={!form.name || !form.request}
          style={{ flex: 1 }}
        >
          Submit Request
        </Button>
      </div>
    </Form>
  );
};
