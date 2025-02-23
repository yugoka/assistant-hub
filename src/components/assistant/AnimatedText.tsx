"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
}

export default function AnimatedText({ text }: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => {
        if (index < text.length) {
          index++;
          return text.slice(0, index);
        } else {
          clearInterval(intervalId);
          return prev;
        }
      });
    }, 30); // Adjust the speed of typing here

    return () => clearInterval(intervalId);
  }, [text]);

  return (
    <motion.p
      className="text-lg font-medium text-gray-800 dark:text-gray-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {displayedText}
    </motion.p>
  );
}
