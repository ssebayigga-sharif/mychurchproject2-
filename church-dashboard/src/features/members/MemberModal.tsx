import { useEffect, useState } from "react";
import { Close } from "@carbon/icons-react";
import { Button } from "@carbon/react";
import styles from "./MemberModal.module.scss";

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

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form, member?.id);
  };

  const isEditing = Boolean(member);

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div
        className={`${styles.backdrop} ${visible ? styles.open : ""}`}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <aside
        className={`${styles.panel} ${visible ? styles.open : ""}`}
        aria-label={isEditing ? "Edit Member" : "Add Member"}
      >
        {/* Panel header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {isEditing ? "Edit Member" : "Add Member"}
            </h2>
            <p className={styles.subtitle}>
              {isEditing
                ? "Update details for this church member."
                : "Register a new member or visitor."}
            </p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close panel"
            type="button"
          >
            <Close size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className={styles.body}>
          <form id="member-form" onSubmit={submitHandler} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Personal Information</label>
              <div className={styles.row}>
                <input
                  name="firstName"
                  placeholder="First name (e.g. John)"
                  value={form.firstName}
                  onChange={changeHandler}
                  required
                />
                <input
                  name="lastName"
                  placeholder="Last name (e.g. Doe)"
                  value={form.lastName}
                  onChange={changeHandler}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Contact Details</label>
              <input
                name="phone"
                placeholder="Phone number (e.g. +256...)"
                value={form.phone}
                onChange={changeHandler}
                required
                style={{ marginBottom: "1rem" }}
              />
              <input
                name="email"
                type="email"
                placeholder="Email address (optional)"
                value={form.email ?? ""}
                onChange={changeHandler}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Church Registry</label>
              <div className={styles.row}>
                <select
                  name="memberType"
                  value={form.memberType}
                  onChange={changeHandler}
                >
                  <option value="Member">Official Member</option>
                  <option value="Visitor">Visitor / Guest</option>
                </select>

                <select
                  name="department"
                  value={form.department}
                  onChange={changeHandler}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              
              <select
                name="baptismStatus"
                value={form.baptismStatus}
                onChange={changeHandler}
                style={{ marginTop: "1rem" }}
              >
                {BAPTISM_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Footer with actions */}
        <div className={styles.footer}>
          <Button kind="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            kind="primary" 
            type="submit" 
            form="member-form"
          >
            {isEditing ? "Save changes" : "Add member"}
          </Button>
        </div>
      </aside>
    </>
  );
};
