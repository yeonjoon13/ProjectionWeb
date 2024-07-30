'use client';
import React, { useEffect } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { SignedOut } from '@clerk/clerk-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import logoImage from '/public/assets/logo.png';
import { useRouter } from 'next/navigation';

export default function Nav() {
    const { user } = useUser();
    const router = useRouter();
    const userName = user?.fullName;

    useEffect(() => {
        if (user) {
            router.push('/dashboard'); // Navigate to the dashboard
        }
    }, [user, router]);

    return (
        <div className='py-4' style={{ position: 'relative', zIndex: 1000 }}>
            <div className='items-center justify-between flex'>
                <Link href="/" className='flex gap-2 ml-10 items-center text-xl text-black font-medium'>
                    <Image src={logoImage} width="50" height="50" alt="logo" />
                    Johns Hopkins Medicine
                </Link>

                <div className='flex gap-2 mr-10'>
                    {!user && (
                        <Link href="/sign-in">
                            <Button className='rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'>
                                Login
                            </Button>
                        </Link>
                    )}
                    {user && (
                        <>
                            <div className='font-medium text-lg mt-1'>
                                {userName}
                            </div>
                            <UserButton />
                        </>
                    )}
                    <SignedOut />
                </div>
            </div>
        </div>
    );
}
