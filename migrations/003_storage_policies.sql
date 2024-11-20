-- Enable Storage for the bucket
insert into storage.buckets (id, name)
values ('foodiehub', 'foodiehub');

-- Policy for viewing/downloading files (public access)
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'foodiehub' );

-- Policy for uploading files (authenticated users only)
create policy "Authenticated Users Can Upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'foodiehub' AND
  (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Policy for updating files (authenticated users only)
create policy "Authenticated Users Can Update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'foodiehub' AND
  (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Policy for deleting files (authenticated users only)
create policy "Authenticated Users Can Delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'foodiehub' AND
  (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);
