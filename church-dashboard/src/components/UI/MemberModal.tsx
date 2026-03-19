import { useEffect, useState } from "react";
import type { Member } from "../../types/Members";

type MemberModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (member: Member) => void;
  member?: Member;
};

export const MemberModal = ({
  visible,
  onClose,
  onSave,
  member,
}: MemberModalProps) => {
  const [form, setForm] = useState<Member>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    department: "",
    baptized: false,
    joinedAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (member) {
      setForm(member);
    }
  }, [member]);

  if (!visible) return null;

  const changeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setForm({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      department: "",
      baptized: false,
      joinedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{member ? "Edit Member" : "Add Member"}</h3>
        <form onSubmit={submitHandler}>
          <input
            name="firstName"
            placeholder="Enter your firstname"
            value={form.firstName}
            onChange={changeHandler}
            required
          />
          <input
            name="lastName"
            placeholder="Enter your lastName"
            value={form.lastName}
            onChange={changeHandler}
            required
          />
          <input
            name="phone"
            placeholder="Enter your phone number"
            value={form.phone}
            onChange={changeHandler}
            required
          />
          <input
            name="email"
            placeholder=" your e-mail"
            value={form.email}
            onChange={changeHandler}
          />
          <input
            name="department"
            placeholder="your department"
            value={form.department}
            onChange={changeHandler}
            required
          />
          <label>
            Baptized
            <input
              type="checkbox"
              name="baptized"
              required
              checked={form.baptized}
              onChange={changeHandler}
            />
          </label>
          <div className="modal-actions">
            <button type="submit"> Save</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
