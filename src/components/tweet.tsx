import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, database, storage } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
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

const EditForm = styled.form``;
const EditTextarea = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  &::placeholder {
    font-size: 16px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
      sans-serif;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;
const FlexWrap = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;
const BtnWrap = styled.div`
  * {
    &:not(:last-child) {
      margin-right: 5px;
    }
  }
`;
const DeletePhotoBtn = styled.button`
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
const UpdatePhotoBtn = styled.label`
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
const UpdatePhotoFile = styled.input`
  display: none;
`;
const EditSubmitBtn = styled.input`
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
const CancelBtn = styled.button`
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
const Error = styled.p`
  color: tomato;
  margin-top: 10px;
`;

export default function Tweet({ username, photo, tweet, userId, id }: ITweet) {
  const user = auth.currentUser;
  const [isLoading, setIsLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [editTweet, setEditTweet] = useState("");
  const [updateFile, setUpdateFile] = useState<File | null>(null);
  const [error, setError] = useState("");

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
      setEditTweet(tweet);
      setEdit(true);
    }
  };

  const onDeletePhoto = async () => {
    const ok = confirm("Are you sure delete image?");
    if (!ok && !photo) return;
    try {
      const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
      await deleteObject(photoRef);
      await updateDoc(doc(database, "tweets", id), {
        photo: "",
      });
    } catch (e) {
      console.log(e);
    } finally {
      setEdit(true);
    }
  };

  const onEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditTweet(e.target.value);
  };

  const onUpdateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      if (files[0].size > 1 * 1024 * 1024) {
        setError("파일의 크기는 최대 1Mb가 넘을 수 없습니다.");
        return;
      }
      setUpdateFile(files[0]);
    }
  };

  const onEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isLoading || editTweet === "" || editTweet.length > 180)
      return;
    try {
      await updateDoc(doc(database, "tweets", id), {
        tweet: editTweet,
      });
      if (updateFile) {
        if (photo) {
          const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
          await deleteObject(photoRef);
        }
        const locationRef = ref(storage, `tweets/${user.uid}/${id}`);
        const result = await uploadBytes(locationRef, updateFile);
        const url = await getDownloadURL(result.ref);
        await updateDoc(doc(database, "tweets", id), {
          photo: url,
        });
      }
      setEditTweet(tweet);
      setUpdateFile(null);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
      setEdit(false);
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
        <EditForm onSubmit={onEditSubmit}>
          <EditTextarea onChange={onEditChange} rows={5} value={editTweet} />
          <FlexWrap>
            <BtnWrap>
              <DeletePhotoBtn onClick={onDeletePhoto}>
                Delete Photo
              </DeletePhotoBtn>
              <UpdatePhotoBtn htmlFor="updateFile">
                {updateFile ? "Uploaded" : "Update Photo"}
              </UpdatePhotoBtn>
              <UpdatePhotoFile
                onChange={onUpdateFileChange}
                type="file"
                id="updateFile"
                accept="image/*"
              />
            </BtnWrap>
            <BtnWrap>
              <EditSubmitBtn
                type="submit"
                value={isLoading ? "Update Posting..." : "Edit Tweet"}
              />
              <CancelBtn onClick={onSetEdit}>Cancel</CancelBtn>
            </BtnWrap>
          </FlexWrap>
          {error ? <Error>{error}</Error> : null}
        </EditForm>
      ) : null}
    </>
  );
}
