import { useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  Select,
  SelectItem,
  FormGroup,
  Stack,
} from "@carbon/react";
import type {
  Member,
  CreateMemberInput,
  MemberDepartment,
  BaptismStatus,
} from "../../types/church.types";

type MemberModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CreateMemberInput, id?: string) => void;
  member?: Member;
};

const DEPARTMENTS: MemberDepartment[] = [
  "Sabbath School",
  "Youth",
  "Children",
  "Music",
  "Deacons",
  "Deaconesses",
  "Community Services",
  "Health",
  "Communication",
  "Personal Ministries",
];

const BAPTISM_STATUSES: BaptismStatus[] = [
  "Baptized",
  "Not baptized",
  "In preparation",
];

const DEFAULT_FORM: CreateMemberInput = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  department: "Sabbath School",
  baptismStatus: "Not baptized",
  memberType: "Member",
};

export const MemberModal = ({
  visible,
  onClose,
  onSave,
  member,
}: MemberModalProps) => {
  const [form, setForm] = useState<CreateMemberInput>(DEFAULT_FORM);

  useEffect(() => {
    if (member) {
      const { id: _id, joinedAt: _joinedAt, ...editableFields } = member;
      setForm(editableFields);
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [member, visible]);

  const changeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = () => {
    onSave(form, member?.id);
  };

  const isEditing = Boolean(member);

  return (
    <Modal
      open={visible}
      modalHeading={isEditing ? "Edit Member" : "Add Member"}
      primaryButtonText={isEditing ? "Save changes" : "Add member"}
      secondaryButtonText="Cancel"
      onRequestClose={onClose}
      onRequestSubmit={submitHandler}
      size="md"
    >
      <Stack gap={7}>
        <FormGroup legendText="Personal Information">
          <div style={{ display: "flex", gap: "1rem" }}>
            <TextInput
              id="firstName"
              name="firstName"
              labelText="First name"
              placeholder="e.g. John"
              value={form.firstName}
              onChange={changeHandler}
              required
            />
            <TextInput
              id="lastName"
              name="lastName"
              labelText="Last name"
              placeholder="e.g. Doe"
              value={form.lastName}
              onChange={changeHandler}
              required
            />
          </div>
        </FormGroup>

        <FormGroup legendText="Contact Details">
          <TextInput
            id="phone"
            name="phone"
            labelText="Phone number"
            placeholder="e.g. +256..."
            value={form.phone}
            onChange={changeHandler}
            required
          />
          <TextInput
            id="email"
            name="email"
            labelText="Email address (optional)"
            type="email"
            placeholder="e.g. name@example.com"
            value={form.email ?? ""}
            onChange={changeHandler}
            style={{ marginTop: "1rem" }}
          />
        </FormGroup>

        <FormGroup legendText="Church Registry">
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <Select
              id="memberType"
              name="memberType"
              labelText="Registry Type"
              value={form.memberType}
              onChange={changeHandler}
            >
              <SelectItem value="Member" text="Official Member" />
              <SelectItem value="Visitor" text="Visitor / Guest" />
            </Select>

            <Select
              id="department"
              name="department"
              labelText="Department"
              value={form.department}
              onChange={changeHandler}
            >
              {DEPARTMENTS.map((dept) => (
                <SelectItem key={dept} value={dept} text={dept} />
              ))}
            </Select>
          </div>

          <Select
            id="baptismStatus"
            name="baptismStatus"
            labelText="Baptism Status"
            value={form.baptismStatus}
            onChange={changeHandler}
          >
            {BAPTISM_STATUSES.map((status) => (
              <SelectItem key={status} value={status} text={status} />
            ))}
          </Select>
        </FormGroup>
      </Stack>
    </Modal>
  );
};
