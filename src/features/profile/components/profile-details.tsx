'use client';

import { Check, Trash2, Upload } from 'lucide-react';
import { useId, useRef, useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { FieldError } from '@/components/ui/field-error';
import { FormField } from '@/components/ui/form-field';
import { apiErrorMessage } from '@/lib/form-errors';
import type { Session } from '@/types/api';
import { MAX_FILE_BYTES } from '@/types/constants';
import { useRemoveAvatar, useSetAvatar, useUpdateName } from '../api';

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Photo and name. Everyone in the household sees both on bills, spending and the family page. */
export function ProfileDetails({ session }: { session: Session }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const setAvatar = useSetAvatar();
  const removeAvatar = useRemoveAvatar();
  const updateName = useUpdateName();
  const [photoError, setPhotoError] = useState<string>();
  const [name, setName] = useState(session.user.name);
  const [nameError, setNameError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const { user } = session;

  function pickPhoto(file: File | undefined) {
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) return setPhotoError('Use a JPG, PNG or WebP image');
    if (file.size > MAX_FILE_BYTES) return setPhotoError('The photo must be 5 MB or smaller');
    setPhotoError(undefined);
    setAvatar.mutate(file, { onError: (e) => setPhotoError(apiErrorMessage(e)) });
  }

  function saveName(e: FormEvent) {
    e.preventDefault();
    const value = name.trim();
    if (!value) return setNameError('Name is required');
    setNameError(undefined);
    updateName.mutate(value, {
      onSuccess: (s) => {
        setName(s.user.name);
        setSaved(true);
      },
      onError: (err) => setNameError(apiErrorMessage(err)),
    });
  }

  return (
    <Card className="flex flex-col gap-6">
      <CardTitle>Your details</CardTitle>

      <div className="flex flex-wrap items-center gap-5">
        <Avatar name={user.name} src={user.avatarUrl} size="lg" />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept={PHOTO_TYPES.join(',')}
              className="sr-only"
              onChange={(e) => pickPhoto(e.target.files?.[0])}
            />
            <Button variant="outline" size="sm" loading={setAvatar.isPending} onClick={() => inputRef.current?.click()}>
              {!setAvatar.isPending && <Upload aria-hidden className="size-4" />}
              {user.avatarUrl ? 'Change photo' : 'Upload photo'}
            </Button>
            {user.avatarUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger-subtle"
                loading={removeAvatar.isPending}
                onClick={() => removeAvatar.mutate(undefined, { onError: (e) => setPhotoError(apiErrorMessage(e)) })}
              >
                {!removeAvatar.isPending && <Trash2 aria-hidden className="size-4" />}
                Remove
              </Button>
            )}
          </div>
          <span className="text-xs text-muted-foreground">JPG, PNG or WebP, up to 5 MB. Your family sees it.</span>
          <FieldError message={photoError} />
        </div>
      </div>

      <form onSubmit={saveName} noValidate className="flex flex-col gap-4 border-t border-border pt-6">
        <FormField
          id="profile-name"
          label="Name"
          autoComplete="name"
          maxLength={80}
          value={name}
          error={nameError}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
        />
        <FormField id="profile-email" label="Email" value={user.email} readOnly hint="Used to log in; it can't be changed" className="read-only:bg-neutral read-only:text-muted-foreground" />
        {saved && name.trim() === user.name && (
          <Alert tone="success" icon={Check}>
            Name saved.
          </Alert>
        )}
        <Button type="submit" className="self-start" loading={updateName.isPending} disabled={!name.trim() || name.trim() === user.name}>
          Save name
        </Button>
      </form>
    </Card>
  );
}
