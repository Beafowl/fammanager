create table item(
	item_name text primary key,
	worth integer not null,
	amount integer default 0
);

insert into item(item_name, worth, amount)
values('glace', 1000000, 10);

insert into item(item_name, worth, amount)
values('draco', 70000, 10);

insert into item(item_name, worth, amount)
values('cuby', 150000, 6);

insert into item(item_name, worth, amount)
values('ginseng', 700000, 6);

insert into item(item_name, worth, amount)
values('dc', 400000, 6);

create table fammanager(
	discord_name text primary key,
	ingame_name text not null,
	donation_amount integer default 0,
	donation_total integer default 0,
	donation_amount_weekly integer null, -- null: did not specify an amount
	expiration_date date default Date(Now() + cast((5 - extract(dow from Now()))
           + (case when extract(dow from Now()) < 5 then 0 else 7 end) || ' day' as interval)));
	

create table birthday(
	birthday_date date not null,
	discord_name text primary key
);