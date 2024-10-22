import { doc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import styled from "styled-components";
import { auth, database, storage } from "../firebase";
import { useState } from "react";
import { ITweet } from "./timeline";

interface IUpdateTweetform extends ITweet {
  setEdit: React.Dispatch<React.SetStateAction<boolean>>;
  onSetEdit: () => void;
}

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

export default function UpdateTweetForm({
  id,
  photo,
  tweet,
  setEdit,
  onSetEdit,
}: IUpdateTweetform) {
  const user = auth.currentUser;
  const [isLoading, setIsLoading] = useState(false);
  const [editTweet, setEditTweet] = useState(tweet);
  const [deleted, setDeleted] = useState(false);
  const [updateFile, setUpdateFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const onDeletePhoto = () => {
    if (!photo) return;
    setDeleted(true);
    setEdit(true);
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

  const deletedPhoto = async () => {
    const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
    await deleteObject(photoRef);
  };

  const onEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || isLoading || editTweet === "" || editTweet.length > 180)
      return;
    try {
      await updateDoc(doc(database, "tweets", id), {
        tweet: editTweet,
      });
      if (deleted) {
        deletedPhoto();
        await updateDoc(doc(database, "tweets", id), {
          photo: "",
        });
      }
      if (updateFile) {
        if (photo) {
          deletedPhoto();
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
      setDeleted(false);
    }
  };
  return (
    <EditForm onSubmit={onEditSubmit}>
      <EditTextarea onChange={onEditChange} rows={5} value={editTweet} />
      <FlexWrap>
        <BtnWrap>
          <DeletePhotoBtn type="button" onClick={onDeletePhoto}>
            {!deleted ? "Delete Photo" : "Deleted"}
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
  );
}
