-- 0. 기존 테이블 초기화 (테스트 환경에서만 사용, 기존 데이터가 모두 삭제됩니다!)
drop table if exists public.locations cascade;
drop table if exists public.members cascade;
drop table if exists public.rooms cascade;

-- 1. 확장 기능 활성화 (UUID 생성용)
create extension if not exists "uuid-ossp";

-- 2. Rooms 테이블 생성 (여행 방)
create table public.rooms (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    start_date date not null,
    end_date date not null,
    created_by uuid references auth.users(id) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Members 테이블 생성 (방 참여자 및 색상 정보)
create table public.members (
    id uuid default uuid_generate_v4() primary key,
    room_id uuid references public.rooms(id) on delete cascade not null,
    user_id uuid references auth.users(id) not null,
    color_code text not null,
    role text default 'editor'::text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(room_id, user_id) -- 한 명의 유저는 한 방에 한 번만 참여 가능
);

-- 4. Locations 테이블 생성 (장소 핀 데이터)
create table public.locations (
    id uuid default uuid_generate_v4() primary key,
    room_id uuid references public.rooms(id) on delete cascade not null,
    place_id text not null, -- Google Places API의 place_id (또는 AI 분석 식별자)
    name text not null,
    address text,
    description text,
    category text,
    lat double precision not null,
    lng double precision not null,
    added_by uuid references auth.users(id),
    status text default 'wishlist'::text not null, -- 'wishlist' 또는 'confirmed'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Row Level Security (RLS) 설정
-- 테스트/프로토타입 단계이므로, 인증된 유저(authenticated)에게 모든 권한을 허용합니다.
-- 추후 프로덕션 배포 시에는 members 테이블을 조인하여 권한을 세밀하게 제어해야 합니다.

alter table public.rooms enable row level security;
alter table public.members enable row level security;
alter table public.locations enable row level security;

create policy "인증된 사용자는 rooms 테이블 읽기/쓰기 가능"
on public.rooms for all to authenticated using (true);

create policy "인증된 사용자는 members 테이블 읽기/쓰기 가능"
on public.members for all to authenticated using (true);

create policy "인증된 사용자는 locations 테이블 읽기/쓰기 가능"
on public.locations for all to authenticated using (true);
