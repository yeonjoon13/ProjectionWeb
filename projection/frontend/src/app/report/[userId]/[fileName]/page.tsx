'use client'
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '/src/app/globals.css'; // Make sure to import your CSS file
import redHeart from '/public/assets/redHeart.jpg'; // Import a file image
import yellowHeart from '/public/assets/yellow.webp'; // Import a file image
import greenHeart from '/public/assets/health-care.png'; // Import a file image
import Header from '/src/components/Header'; // Import the Header component
import Chart from '/src/components/Chart'; // Import the Chart component
import Image from 'next/image';
import { Disclosure } from '@headlessui/react';
import { ChevronDown, ChevronUp, Heart, HeartPulse, HeartCrack, CalendarHeart, MessageCircleWarning } from "lucide-react";
import dynamic from "next/dynamic";
const GaugeComponent = dynamic(() => import('react-gauge-component'), { ssr: false });

const ReportPage = ({ params }) => {
  const { userId, fileName } = params;
  const [fileData, setFileData] = useState('');
  const [parsedData, setParsedData] = useState({});
  const [collectedBy, setCollectedBy] = useState('');
  const [collectedDate, setCollectedDate] = useState('');
  const [prediction, setPrediction] = useState(['', '']);
  const [isLoading, setIsLoading] = useState(true); // State for loading indicator

  // Refs for section navigation
  const abnormalRef = useRef(null);
  const optimalRef = useRef(null);
  const normalRef = useRef(null);
  const predictionRef = useRef(null);

  const Card = ({ children }) => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {children}
    </div>
  );

  useEffect(() => {
    const fetchFileData = async () => {
      if (userId && fileName) {
        try {
          setIsLoading(true); // Start loading indicator
          const response = await axios.get(`http://localhost:8080/api/v1/file-upload/fileData/${userId}/${fileName}`);
          const data = response.data;
          setFileData(data);

          const predictionResponse = await axios.post('http://127.0.0.1:5000/process-file-data', data, {
            headers: {
              'Content-Type': 'text/plain',
            },
          });

          // Parse the fileData here and set it to parsedData state
          const parsed = parseData(data);
          setParsedData(parsed);
          setPrediction(predictionResponse.data.interpretation);
        } catch (error) {
          console.error('Error fetching file data:', error);
        } finally {
          setIsLoading(false); // Stop loading indicator
        }
      }
    };

    fetchFileData();
  }, [userId, fileName]);

  const parseData = (data) => {
    // Assuming the data is in a simple key-value format:
    const lines = data.split('\n');
    const parsed = lines.reduce((acc, line) => {
      const [key, value] = line.split(':');
      const trimmedKey = key.trim();
      const trimmedValue = value.trim();
      
      if (trimmedKey === 'Collected By') {
        setCollectedBy(trimmedValue);
      } else if (trimmedKey === 'Collected Date') {
        setCollectedDate(trimmedValue);
      } else if (trimmedKey === 'Outcome') {

      } else {
        acc[trimmedKey] = trimmedValue;
      }
      return acc;
    }, {});
    return parsed;
  };

  const isAbnormal = (value, range) => {
    if (!range) return false;
    const val = parseFloat(value);
    return val >= range.high;
  };

  const isOutsideOptimal = (value, range) => {
    if (!range) return false;
    const val = parseFloat(value);
    return val >= range.aboveOptimal && val < range.high;
  };

  const ranges = {
    Glucose: { low: 0, belowOptimal: 50, optimal: 70, aboveOptimal: 100, high: 125 },
    Creatinine: { low: 0, belowOptimal: 0.6, optimal: 0.7, aboveOptimal: 1.1, high: 1.3},
    Sodium: { low: 0, belowOptimal: 135, optimal: 136, aboveOptimal: 145, high: 146 },
    TotalProtein: { low: 0, belowOptimal: 6.0, optimal: 6.5, aboveOptimal: 8.4, high: 8.9 },
    AlkPhos: { low: 0, belowOptimal: 20, optimal: 40, aboveOptimal: 130, high: 150 },
    Potassium: { low: 0, belowOptimal: 3.5, optimal: 3.8, aboveOptimal: 5.1, high: 5.5 },
    Chloride: {low: 0, belowOptimal: 95, optimal: 98, aboveOptimal: 106, high: 110 },
    Calcium: {low: 0, belowOptimal: 8.5, optimal: 8.9, aboveOptimal: 10.6, high: 11.5 },
    Albumin: { low: 0,belowOptimal: 3.5,optimal: 3.9,aboveOptimal: 5.1,high: 5.5 },
    BUN: { low: 0,belowOptimal: 7,optimal: 10,aboveOptimal: 21,high: 30},
    AST: {low: 0,belowOptimal: 10,optimal: 20,aboveOptimal: 41,high: 60},
    ALT: { low: 0, belowOptimal: 7, optimal: 21, aboveOptimal: 41, high: 60 },
    Globulin: { low: 0, belowOptimal: 2.0, optimal: 2.5, aboveOptimal: 4.1, high: 5.0 },
    Bilirubin: {low: 0,belowOptimal: 0.2,optimal: 0.5,aboveOptimal: 1.1,high: 2.0},
    T3: {low: 0,belowOptimal: 0.8,optimal: 1.2,aboveOptimal: 2.8,high: 3.0},
    T4: {low: 0,belowOptimal: 4.5,optimal: 6.0,aboveOptimal: 12.1,high: 14.0 },
    TSH: { low: 0, belowOptimal: 0.3, optimal: 0.5, aboveOptimal: 5.1, high: 10.0 },
    BMI: { low: 0, belowOptimal: 16, normal: 18.6, aboveOptimal: 25, high: 30, }
  };

  // Display loading indicator while fetching data
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div>
      <Header collectedBy={collectedBy} collectedDate={collectedDate} /> {/* Pass collectedBy and collectedDate to Header */}
      <div className="flex px-6 mt-8">
        <div className="sidebar w-64 p-4">
          <Disclosure defaultOpen>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex items-center justify-between w-full p-2 text-left text-sm font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-blue-100 focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75">
                  <div className="flex items-center gap-3">
                    <CalendarHeart className="w-5 h-5 text-gray-500 " />
                    <span className='text-lg'>Summary</span>
                  </div>
                  {open ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </Disclosure.Button>
                <Disclosure.Panel className="pt-2 pb-2 pl-5 pr-2 text-sm text-gray-500">
                  <ul>
                    <div className='flex gap-2'>
                      <HeartCrack className='mt-6'/>
                      <li className="py-3 text-base text-bold">
                        <a href="#" onClick={() => abnormalRef.current.scrollIntoView({ behavior: 'smooth' })}>Abnormal</a>
                      </li>
                    </div>
                    <div className='flex gap-2'>
                      <HeartPulse className='mt-6'/>
                      <li className="py-3 text-base text-bold">
                        <a href="#" onClick={() => optimalRef.current.scrollIntoView({ behavior: 'smooth' })}>Outside Optimal</a>
                      </li>
                    </div>
                    <div className='flex gap-2'>
                      <Heart className='mt-6'/>
                      <li className="py-3 text-base text-bold">
                        <a href="#" onClick={() => normalRef.current.scrollIntoView({ behavior: 'smooth' })}>Normal</a>
                      </li>
                    </div>
                    <div className='flex gap-2'>
                    <MessageCircleWarning className='mt-6'/>
                    <li className="py-3 text-base text-bold">
                      <a href="#" onClick={() => predictionRef.current.scrollIntoView({ behavior: 'smooth' })}>Prediction Results</a>
                    </li>
                  </div>
                  </ul>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </div>
        <div className="content flex-grow p-4">
          <div ref={abnormalRef} className="section" id="abnormal">
            <div className='flex gap-3'>
              <Image src={redHeart} alt="Red Image" width={40} height={40} />
              <h3 className='text-gray-800 font-semibold text-2xl mt-1'>Abnormal</h3>
            </div>
            <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
            {Object.keys(parsedData).map((key) => (
              isAbnormal(parsedData[key], ranges[key]) && (
                <Chart 
                  label={key}
                  key={key}
                  title={key}
                  value={parsedData[key]}
                  unit="mg/dL" // Replace with the appropriate unit
                  ranges= {ranges[key]}
                />
              )
            ))}
          </div>
          <div ref={optimalRef} className="section" id="outside-optimal">
            <div className='flex gap-3'>
              <Image src={yellowHeart} alt="Yellow Image" width={40} height={40} />
              <h3 className='text-gray-800 font-semibold text-2xl mt-1'>Outside Optimal Range</h3>
            </div>
            <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
            {Object.keys(parsedData).map((key) => (
              isOutsideOptimal(parsedData[key], ranges[key]) && (
                <Chart 
                  label={key}
                  key={key}
                  title={key}
                  value={parsedData[key]}
                  unit="mg/dL" // Replace with the appropriate unit
                  ranges= {ranges[key]}
                />
              )
            ))}
          </div>
          <div ref={normalRef} className="section" id="normal">
            <div className='flex gap-3 ml-1'>
              <Image src={greenHeart} alt="Green Image" width={35} height={35} />
              <h3 className='text-gray-800 font-semibold text-2xl'>Normal</h3>
            </div>
            <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
            {Object.keys(parsedData).map((key) => (
              !isAbnormal(parsedData[key], ranges[key]) && !isOutsideOptimal(parsedData[key], ranges[key]) && (
                <div className="card normal-card" key={key}>
                  <h4>{key}</h4>
                  <div className="value">{parsedData[key]}</div>
                  <div className="status">Normal</div>
                  <div className="green-bar"></div> {/* Green bar for normal cards */}
                </div>
              )
            ))}
          </div>
          <div ref={predictionRef} className="section" id="prediction-results">
            <div className='flex gap-3 ml-1 mt-10'>
              <h3 className='text-gray-800 font-semibold text-2xl mt-5'>Prediction Results</h3>
            </div>
            <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
            <Card>
              <div className='flex'>
                <div style={{ width: '50%' }}>
                  <GaugeComponent
                    value={parseFloat(prediction[0].split(': ')[1]) * 100}
                    pointer={{ type: "blob", animationDelay: 50 }}
                    type="semicircle"
                    arc={{
                      colorArray: ['#2ecc71', '#FF2121'],
                      padding: 0.02,
                      subArcs:
                        [
                          { limit: 40 },
                          { limit: 60 },
                          { limit: 70 },
                          {},
                          {},
                          {},
                          {}
                        ]
                    }}
                  />
                </div>
                <div className="ml-4 mt-10">
                  <h4 className="text-gray-800 font-bold text-xl">Prediction:</h4>
                  <h4 className="text-gray-800 font-medium text-lg">{prediction[1]}</h4>
                  <h4 className="text-gray-800 font-bold text-xl mt-2">Probability:</h4>
                  <h4 className="text-gray-800 font-medium text-lg">{parseFloat(prediction[0].split(': ')[1]) * 100}%</h4>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
