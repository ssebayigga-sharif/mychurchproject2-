import { useEffect, useState } from "react";
import type {
  Member,
  CreateMemberInput,
  MemberDepartment,
  BaptismStatus,
} from "../../types/church.types";
import styles from "./MemberModal.module.scss";

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

  if (!visible) return null;

  const changeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
    <div className={styles.backdrop}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <h3>{isEditing ? "Edit Member" : "Add Member"}</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={submitHandler}>
          <div className={styles.modalBody}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>First name</label>
                <input
                  name="firstName"
                  placeholder="First name"
                  value={form.firstName}
                  onChange={changeHandler}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Last name</label>
                <input
                  name="lastName"
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={changeHandler}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Phone number</label>
              <input
                name="phone"
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={changeHandler}
                required
              />
            </div>

            <div className={styles.field}>
              <label>
                Email address{" "}
                <span className={styles.optional}>(optional)</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="Email address"
                value={form.email ?? ""}
                onChange={changeHandler}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>Person Role</label>
                <select
                  name="memberType"
                  value={form.memberType || "Member"}
                  onChange={changeHandler}
                  required
                >
                  <option value="Member">Official Member</option>
                  <option value="Visitor">Visitor / Guest</option>
                </select>
              </div>

              <div className={styles.field}>
                <label>Department</label>
              <select
                name="department"
                value={form.department}
                onChange={changeHandler}
                required
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
              <label>Baptism status</label>
              <select
                name="baptismStatus"
                value={form.baptismStatus}
                onChange={changeHandler}
                required
              >
                {BAPTISM_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className={styles.btnSave}>
              Save member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
