import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, database, storage } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useState } from "react";
import UpdateTweetForm from "./update-tweet-form";

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
  margin-left: 5px;
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

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const user = auth.currentUser;
  const [edit, setEdit] = useState(false);

  const onDelete = async () => {
    if (edit) {
      setEdit(false);
    }
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

  const onSetEdit = () => {
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
              <EditButton onClick={onSetEdit}>Edit</EditButton>
            </>
          ) : null}
        </Column>
        <Column>{photo ? <Photo src={photo} /> : null}</Column>
      </Wrapper>
      {edit ? (
        <UpdateTweetForm
          id={id}
          photo={photo}
          tweet={tweet}
          onSetEdit={onSetEdit}
          setEdit={setEdit}
        />
      ) : null}
    </>
  );
}
