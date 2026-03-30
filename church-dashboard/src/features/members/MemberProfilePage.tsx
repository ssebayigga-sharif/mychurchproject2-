import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type {
  Member,
  MemberProfile,
  CreateMemberProfileInput,
  Gender,
  MaritalStatus,
} from "../../types/church.types";
import { getMembers } from "../../services/memberServices";
import {
  getProfileByMemberId,
  createProfile,
  updateProfile,
} from "../../services/profileServices";
import styles from "./MemberProfilePage.module.scss";

// ─── Constants ────────────────────────────────────────────────────────────────

const GENDERS: Gender[] = ["Male", "Female"];

const MARITAL_STATUSES: MaritalStatus[] = [
  "Single",
  "Married",
  "Widowed",
  "Divorced",
];

const DEFAULT_FORM: Omit<CreateMemberProfileInput, "memberId"> = {
  dateOfBirth: "",
  gender: undefined,
  age: undefined,
  phone: "",
  email: "",
  address: "",
  city: "",
  country: "Uganda",
  emergencyContact: { name: "", relationship: "", phone: "" },
  familyInfo: {
    maritalStatus: "Single",
    spouseName: "",
    numberOfChildren: 0,
  },
  homeChurchInfo: {
    currentChurch: "Kabulengwa English SDA Church",
    formerChurch: "",
    transferDate: "",
    transferFromCity: "",
  },
  healthNotes: {
    dietaryNeeds: "",
    disabilities: "",
    otherNotes: "",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const MemberProfilePage = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<Member | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const loadData = useCallback(async () => {
    if (!memberId) return;
    try {
      setIsLoading(true);
      setError(null);

      const [members, existingProfile] = await Promise.all([
        getMembers(),
        getProfileByMemberId(memberId),
      ]);

      const found = members.find((m) => m.id === memberId);
      if (!found) {
        setError("Member not found.");
        return;
      }

      setMember(found);

      if (existingProfile) {
        setProfile(existingProfile);
        // Populate form with existing data, strip db-only fields
        const {
          id: _id,
          updatedAt: _u,
          memberId: _m,
          ...editable
        } = existingProfile;
        setForm(editable);
      } else {
        // Pre-fill phone and email from member registry
        setForm((prev) => ({
          ...prev,
          phone: found.phone,
          email: found.email ?? "",
        }));
      }
    } catch {
      setError("Failed to load profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (
    section: keyof typeof form,
    field: string,
    value: string | number,
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) return;

    try {
      setIsSaving(true);
      setError(null);

      if (profile) {
        await updateProfile(profile.id, form);
      } else {
        await createProfile({ ...form, memberId });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await loadData();
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>Loading profile...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>{error ?? "Member not found."}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <button className={styles.btnBack} onClick={() => navigate("/members")}>
          ← Back to members
        </button>
        <div>
          <h2 className={styles.heading}>
            {member.firstName} {member.lastName}
          </h2>
          <p className={styles.subheading}>
            {member.department} · {member.baptismStatus}
          </p>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {saved && <p className={styles.success}>Profile saved successfully.</p>}

      <form onSubmit={handleSubmit}>
        {/* ── Personal Information ── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Personal information</h3>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Date of birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth ?? ""}
                onChange={handleChange}
              />
            </div>
            <div className={styles.field}>
              <label>Age</label>
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={form.age ?? ""}
                onChange={handleChange}
                min={1}
                max={120}
              />
            </div>
            <div className={styles.field}>
              <label>Gender</label>
              <select
                name="gender"
                value={form.gender ?? ""}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ── Contact & Location ── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Contact & location</h3>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Phone number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label>
                Email address{" "}
                <span className={styles.optional}>(optional)</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email ?? ""}
                onChange={handleChange}
              />
            </div>
            <div className={styles.field}>
              <label>Address</label>
              <input
                name="address"
                placeholder="Street address"
                value={form.address ?? ""}
                onChange={handleChange}
              />
            </div>
            <div className={styles.field}>
              <label>City</label>
              <input
                name="city"
                placeholder="City"
                value={form.city ?? ""}
                onChange={handleChange}
              />
            </div>
            <div className={styles.field}>
              <label>Country</label>
              <input
                name="country"
                placeholder="Country"
                value={form.country ?? ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* ── Emergency Contact ── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Emergency contact</h3>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Full name</label>
              <input
                placeholder="Contact name"
                value={form.emergencyContact?.name ?? ""}
                onChange={(e) =>
                  handleNestedChange("emergencyContact", "name", e.target.value)
                }
              />
            </div>
            <div className={styles.field}>
              <label>Relationship</label>
              <input
                placeholder="e.g. Spouse, Parent, Sibling"
                value={form.emergencyContact?.relationship ?? ""}
                onChange={(e) =>
                  handleNestedChange(
                    "emergencyContact",
                    "relationship",
                    e.target.value,
                  )
                }
              />
            </div>
            <div className={styles.field}>
              <label>Phone number</label>
              <input
                type="tel"
                placeholder="Emergency contact phone"
                value={form.emergencyContact?.phone ?? ""}
                onChange={(e) =>
                  handleNestedChange(
                    "emergencyContact",
                    "phone",
                    e.target.value,
                  )
                }
              />
            </div>
          </div>
        </section>

        {/* ── Family Info ── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Family information</h3>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Marital status</label>
              <select
                value={form.familyInfo?.maritalStatus ?? "Single"}
                onChange={(e) =>
                  handleNestedChange(
                    "familyInfo",
                    "maritalStatus",
                    e.target.value,
                  )
                }
              >
                {MARITAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {form.familyInfo?.maritalStatus === "Married" && (
              <div className={styles.field}>
                <label>Spouse name</label>
                <input
                  placeholder="Spouse full name"
                  value={form.familyInfo?.spouseName ?? ""}
                  onChange={(e) =>
                    handleNestedChange(
                      "familyInfo",
                      "spouseName",
                      e.target.value,
                    )
                  }
                />
              </div>
            )}
            <div className={styles.field}>
              <label>Number of children</label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={form.familyInfo?.numberOfChildren ?? ""}
                onChange={(e) =>
                  handleNestedChange(
                    "familyInfo",
                    "numberOfChildren",
                    Number(e.target.value),
                  )
                }
              />
            </div>
          </div>
        </section>

        {/* ── Church Info ── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Church information</h3>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label>Current church</label>
              <input
                placeholder="Current church name"
                value={form.homeChurchInfo?.currentChurch ?? ""}
                onChange={(e) =>
                  handleNestedChange(
                    "homeChurchInfo",
                    "currentChurch",
                    e.target.value,
                  )
                }
              />
            </div>
            <div className={styles.field}>
              <label>
                Former church{" "}
                <span className={styles.optional}>(if transferred)</span>
              </label>
              <input
                placeholder="Previous church name"
                value={form.homeChurchInfo?.formerChurch ?? ""}
                onChange={(e) =>
                  handleNestedChange(
                    "homeChurchInfo",
                    "formerChurch",
                    e.target.value,
                  )
                }
              />
            </div>
            <div className={styles.field}>
              <label>Transfer date</label>
              <input
                type="date"
                value={form.homeChurchInfo?.transferDate ?? ""}
                onChange={(e) =>
                  handleNestedChange(
                    "homeChurchInfo",
                    "transferDate",
                    e.target.value,
                  )
                }
              />
            </div>
            <div className={styles.field}>
              <label>Transferred from city</label>
              <input
                placeholder="City of former church"
                value={form.homeChurchInfo?.transferFromCity ?? ""}
                onChange={(e) =>
                  handleNestedChange(
                    "homeChurchInfo",
                    "transferFromCity",
                    e.target.value,
                  )
                }
              />
            </div>
          </div>
        </section>

        {/* ── Health Notes ── */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Health notes</h3>
          <div className={styles.grid1}>
            <div className={styles.field}>
              <label>
                Dietary needs{" "}
                <span className={styles.optional}>(optional)</span>
              </label>
              <textarea
                placeholder="e.g. Vegetarian, diabetic diet..."
                value={form.healthNotes?.dietaryNeeds ?? ""}
                onChange={(e) =>
                  handleNestedChange(
                    "healthNotes",
                    "dietaryNeeds",
                    e.target.value,
                  )
                }
                rows={2}
              />
            </div>
            <div className={styles.field}>
              <label>
                Disabilities or special needs{" "}
                <span className={styles.optional}>(optional)</span>
              </label>
              <textarea
                placeholder="Any disabilities or accessibility needs..."
                value={form.healthNotes?.disabilities ?? ""}
                onChange={(e) =>
                  handleNestedChange(
                    "healthNotes",
                    "disabilities",
                    e.target.value,
                  )
                }
                rows={2}
              />
            </div>
            <div className={styles.field}>
              <label>
                Other notes <span className={styles.optional}>(optional)</span>
              </label>
              <textarea
                placeholder="Any other relevant health information..."
                value={form.healthNotes?.otherNotes ?? ""}
                onChange={(e) =>
                  handleNestedChange(
                    "healthNotes",
                    "otherNotes",
                    e.target.value,
                  )
                }
                rows={2}
              />
            </div>
          </div>
        </section>

        {/* ── Submit ── */}
        <div className={styles.formFooter}>
          <button type="submit" className={styles.btnSave} disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : profile
                ? "Update profile"
                : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
};
