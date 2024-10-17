import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, database, storage } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useState } from "react";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const Column = styled.div``;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0;
  font-size: 18px;
`;

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

const EditButton = styled.button`
  background-color: #1d9bf0;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

const EditForm = styled.div``;
const EditTextarea = styled.textarea``;
const BtnWrap = styled.div``;
const DeletePhotoBtn = styled.button``;
const UpdatePhotoBtn = styled.button``;
const EditSubmitBtn = styled.input``;

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const user = auth.currentUser;
  const [edit, setEdit] = useState(false);
  const onDelete = async () => {
    const ok = confirm("Are you sure you want to delete thie tweet?");
    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(database, "tweets", id));
      if (photo) {
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (e) {
      console.log(e);
    } finally {
      //
    }
  };
  const onEdit = () => {
    if (edit) {
      setEdit(false);
    } else {
      setEdit(true);
    }
  };
  return (
    <>
      <Wrapper>
        <Column>
          <Username>{username}</Username>
          <Payload>{tweet}</Payload>
          {user?.uid === userId ? (
            <>
              <DeleteButton onClick={onDelete}>Delete</DeleteButton>
              <EditButton onClick={onEdit}>Edit</EditButton>
            </>
          ) : null}
        </Column>
        <Column>{photo ? <Photo src={photo} /> : null}</Column>
      </Wrapper>
      {edit ? (
        <EditForm>
          <EditTextarea value={tweet} />
          <BtnWrap>
            <DeletePhotoBtn>Delete Photo</DeletePhotoBtn>
            <UpdatePhotoBtn>Update Photo</UpdatePhotoBtn>
          </BtnWrap>
          <EditSubmitBtn type="submit" value="Edit Tweet" />
        </EditForm>
      ) : null}
    </>
  );
}
