import { useEffect, useState } from "react";
import type { Member } from "../../types/Members";
import {
  getMembers,
  addMember,
  deleteMember,
  updateMember,
} from "../../services/memberServices";
import { MemberModal } from "../../components/UI/MemberModal";

export const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(
    undefined,
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const data = await getMembers();
    setMembers(data);
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingMember(undefined);
    setModalVisible(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this member?")) {
      await deleteMember(id);
      fetchMembers();
    }
  };

  const handleSave = async (member: Member) => {
    if (member.id) {
      await updateMember(member.id, member);
    } else {
      await addMember(member);
    }
    setModalVisible(false);
    fetchMembers();
  };

  const filteredMembers = members.filter(
    (m) =>
      m.firstName.toLowerCase().includes(search.toLowerCase()) ||
      m.lastName.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <h2 className="head">Kabulengwa Church Members !</h2>
      <div className="members-actions">
        <button onClick={handleAdd}>Add Member</button>
        <input
          placeholder="Search by name or department"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Department</th>
              <th>Baptized</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((m) => (
              <tr key={m.id}>
                <td>
                  {m.firstName} {m.lastName}
                </td>
                <td>{m.phone}</td>
                <td>{m.email}</td>
                <td>{m.department}</td>
                <td>{m.baptized ? "Yes" : "No"}</td>
                <td>
                  <button onClick={() => handleEdit(m)}>Edit</button>
                  <button onClick={() => handleDelete(m.id!)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <MemberModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        member={editingMember}
      />
    </div>
  );
};
