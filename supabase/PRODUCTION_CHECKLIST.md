# Supabase production checklist

This checklist documents the checks to perform in the Supabase project before production deployment. It contains no credentials or service-role keys.

## Local migration review

- [ ] Apply migrations from `supabase/migrations/` in repository order using the project's normal Supabase migration workflow.
- [ ] For existing deployments, apply `20261029140200_harden_pet_images_storage.sql`; editing or re-running the original bucket migration is not a substitute.
- [ ] Confirm `create_pet_images_storage.sql` creates the `pet-images` bucket as public only for the intended public image reads.
- [ ] Confirm authenticated `INSERT`, `UPDATE`, and `DELETE` object policies require the first storage path segment to equal `auth.uid()`.
- [ ] Run `node scripts/check-task-5-supabase.mjs` from the repository root.
- [ ] Review the migration diff and run `git diff --check`.

## Manual checks in Supabase Dashboard

Record the project URL in the deployment runbook or release system; do not put access tokens, passwords, anon keys, or service-role keys in this file.

- [ ] In **Authentication > URL Configuration**, verify the production site URL and redirect URLs.
- [ ] In **Authentication > Providers > Google**, verify Google is enabled, the client ID/secret are configured in Supabase, and redirect URIs match the Google Cloud configuration.
- [ ] In **Database > Publications / Table editor**, verify RLS is enabled for `profiles`, `pets`, `sightings`, `messages`, and notification-preference data.
- [ ] In **Database > Policies**, verify authenticated inserts, updates, and deletes use `auth.uid()` ownership checks and that public reads expose only intended fields/rows.
- [ ] Verify profile, pet, sighting, message, notification-preference, and notification operations behave correctly for two different authenticated users; confirm user B cannot read or modify user A's private records.
- [ ] In **Storage > Buckets**, verify `pet-images` is the only intended public image bucket and that no unrelated bucket is public.
- [ ] In **Storage > Policies**, verify `pet-images` object INSERT, UPDATE, and DELETE policies require `storage.foldername(name)[1] = auth.uid()::text`.
- [ ] Verify Storage bucket restrictions for allowed image content types and maximum file size. Do not rely only on a filename extension or the client `accept` attribute.
- [ ] Confirm the bucket limit is 5 MiB and allowed MIME types are exactly `image/jpeg`, `image/png`, and `image/webp`.
- [ ] Verify public reads work only for intended pet images and that authenticated users cannot write outside their own first-level folder.
- [ ] Test an oversized file and a non-image payload in a staging project, then confirm production bucket settings and policies reject them.
- [ ] Confirm credentials are managed in the deployment platform/Supabase secret settings and rotate any credentials exposed during setup.

## Verification limitation

This repository review cannot access or execute the remote Supabase project. The checklist records manual verification steps; it does not claim that remote RLS, Storage policies, bucket restrictions, Google provider settings, or credential rotation were verified.
