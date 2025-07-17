"use client"
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("")
  const handleClick = () => {
    if(url.trim())
    router.push(`/analyze?url=${encodeURIComponent(url)}`);
  }
  return (
    <>
    <header className="bg-[#001d46] text-white">
    <nav className="flex justify-between py-6 px-4 ">
      <h1><Link href="/">A11y Central</Link></h1>
      <ul className="flex justify-between gap-6">
        <li><Link href="/about">About</Link></li>
        <li><Link href="/analyze">Analyze</Link></li>
        <li><Link href="/signin">Sign In</Link></li>
      </ul>
    </nav>
    </header>
    <main>
      <section className="flex flex-col items-center justify-center pt-40 gap-y-6">
       
       <label htmlFor="url"> <h2>Paste your url here for an analysis</h2></label>
       <input id="url" type="text" placeholder="Paste your url here" className="w-3/4 p-3 border border-gray-300 rounded-md" 
       value={url}
       onChange={(e) => setUrl(e.target.value)}
      onKeyDownCapture={(e) => e.key === 'Enter' && handleClick()}
       
       />
       <Button className="px-8 py-6 cursor-pointer" onClick={handleClick}>Submit</Button>
       </section>
    </main>
    </>
  )
}
