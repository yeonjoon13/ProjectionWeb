'use client'
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import FileUpload from '@/components/UploadFile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import fileImage from '/public/assets/file.png'; // Import a file image
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Image from 'next/image'; // Import next/image
import MenuBar from '@/components/MenuBar'; // Import custom dropdown menu
import { FileSpreadsheet, FileIcon, StarIcon, Search, Grid2X2, CreditCard } from "lucide-react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'; // Import useRouter

interface UserFile {
  id: number;
  userId: string;
  userName: string;
  fileName: string;
  s3Link: string;
  uploadedAt: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    const fetchUserFiles = async () => {
      if (user) {
        try {
          const response = await axios.get(`http://localhost:8080/api/v1/file-upload/${user.id}`);
          setUserFiles(response.data);
        } catch (error) {
          console.error('Error fetching user files:', error);
        }
      }
    };

    fetchUserFiles();
  }, [user]);

  const handleDelete = (fileId: number) => {
    setUserFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  if (!user) {
    return <div>Loading...</div>; // or some kind of loading state
  }

  const userId = user.id;
  const userName = user.fullName || user.username || user.email; // fallback to other fields if fullName is not available
  const profileImageUrl = user.profileImageUrl; // Get user's profile picture URL

  const filteredFiles = userFiles.filter(file => 
    file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewFile = (userId, fileName) => {
    const encodedFileName = encodeURIComponent(fileName);
    router.push(`/report/${userId}/${encodedFileName}`);
  };


  return (
    <main className="mx-auto pt-16">
      <div className='flex gap-12'>
        <div className='w-40 flex flex-col gap-8 ml-8'>
          <Link href="/">
            <Button variant={"link"} className="flex gap-3 text-base">
              <FileIcon /> All Files
            </Button>
          </Link>
          <Link href="/">
            <Button variant={"link"} className="flex gap-3 text-base">
              <StarIcon /> Starred Files
            </Button>
          </Link>
        </div>
        <div className='w-full ml-8'>
          <div className="flex justify-between items-center">
            <h1 className="text-5xl font-bold">Your Records</h1>
            <div className="flex items-center border rounded-lg px-4 py-2 mr-14 mt-1"> 
              <Search className="mr-2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search files"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-none outline-none w-64 h-7"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="px-6 py-3 mr-10 text-lg">
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Your Blood Test</DialogTitle>
                  <DialogDescription>
                    Drag and Drop file here or Choose file. Supported formats: PDF, DOC. Maximum size: 25MB.
                  </DialogDescription>
                </DialogHeader>
                  <FileUpload userId={userId} userName={userName} />
              </DialogContent>
            </Dialog>
          </div>
          <Tabs defaultValue="cards" className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="cards">
                <div className='gap-2 flex'>
                  <div>
                  <CreditCard />
                  </div>
                  <div className='text-base'>
                    Card View
                  </div>
                  
                </div>
              </TabsTrigger>
              <TabsTrigger value="table">
                <div className='gap-2 flex'>
                  <div>
                    <Grid2X2/>
                  </div>
                  <div className='text-base'>
                    Table View
                  </div>
                  
                </div>
                  
              </TabsTrigger>
            </TabsList>
            <TabsContent value="cards">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredFiles.map((file) => (
                  <Card key={file.id} className="flex flex-col shadow-lg bg-white rounded-lg">
                    <CardHeader className="relative">
                      <CardTitle className='flex gap-2'>
                        <div><FileSpreadsheet className='flex justify-center' /></div>
                        {file.fileName.replace(/\.[^/.]+$/, "")}
                      </CardTitle>
                      <div className='absolute top-5 right-2'>
                        <MenuBar fileId={file.id} onDelete={() => handleDelete(file.id)} />
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-4">
                      <div className="relative w-40 h-40 mb-4">
                        <Image src="/assets/file.png" alt="File" layout="fill" objectFit="cover" />
                      </div>
                      <CardDescription>Uploaded at: {new Date(file.uploadedAt).toLocaleString()}</CardDescription>
                    </CardContent>
                    <CardFooter className="flex justify-center p-4">
                      <Button variant="link" onClick={() => handleViewFile(user.id, file.fileName)} className="text-blue-500">
                        View File
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="table">
            <div className="border rounded-lg p-4 mr-10 mt-4">  {/* Add border, rounded corners, padding, and margin */}
              <div className="max-w-full overflow-x-auto">  {/* Change max-w-7xl to max-w-full */}
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">File Name</TableHead>
                      <TableHead className="text-left">Username</TableHead>
                      <TableHead className="text-left">Upload Date</TableHead>
                      <TableHead className="text-left">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell>{file.fileName}</TableCell>
                        <TableCell>{file.userName}</TableCell>
                        <TableCell>{new Date(file.uploadedAt).toLocaleString()}</TableCell>
                        <TableCell className="text-left">  {/* Align the actions */}
                          <Button variant="link" onClick={() => handleViewFile(user.id, file.id)} className="text-blue-500 ">
                              View File
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}