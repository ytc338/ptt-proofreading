"use client"; // This directive is essential for components using hooks

import React, { useState, useEffect, FC, ReactNode } from 'react';

export const ErrorMessage: FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative my-6" role="alert">
    <strong className="font-bold">錯誤：</strong>
    <span className="block sm:inline">{message}</span>
  </div>
);

