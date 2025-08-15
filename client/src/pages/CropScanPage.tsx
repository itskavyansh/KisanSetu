import React, { useState } from 'react';
import { cropHealthAPI } from '../services/cropHealthService';

const CropScanPage: React.FC = () => {
	const [file, setFile] = useState<File | null>(null);
	const [cropType, setCropType] = useState('tomato');
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0] || null;
		setFile(f);
		setResult(null);
		setError(null);
	};

	const onAnalyze = async () => {
		if (!file) {
			setError('Please select an image first.');
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const res = await cropHealthAPI.analyzeCrop({ image: file, cropType });
			setResult(res.data);
		} catch (e: any) {
			setError(e?.response?.data?.error || 'Failed to analyze image');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-bold">Crop Health Diagnosis</h1>

			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm text-gray-700 mb-2">Crop Type</label>
						<select
							value={cropType}
							onChange={(e) => setCropType(e.target.value)}
							className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-kisan-green focus:border-transparent w-full"
						>
							<option value="tomato">Tomato</option>
							<option value="paddy">Paddy</option>
							<option value="wheat">Wheat</option>
							<option value="onion">Onion</option>
							<option value="potato">Potato</option>
						</select>
					</div>

					<div className="md:col-span-2">
						<label className="block text-sm text-gray-700 mb-2">Upload Photo</label>
						<input
							type="file"
							accept="image/*"
							onChange={onFileChange}
							className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-kisan-green file:text-white hover:file:bg-green-600 cursor-pointer"
						/>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<button
						onClick={onAnalyze}
						disabled={loading || !file}
						className="bg-kisan-green text-white px-4 py-2 rounded-lg disabled:opacity-60"
					>
						{loading ? 'Analyzing...' : 'Analyze'}
					</button>
					{error && <span className="text-red-600 text-sm">{error}</span>}
				</div>
			</div>

			{result && (
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
					<h2 className="text-xl font-semibold">Analysis</h2>
					<div className="text-gray-800 whitespace-pre-wrap">{result.analysis}</div>
					<div>
						<h3 className="font-medium mt-4">Recommendations</h3>
						<ul className="list-disc ml-6 text-gray-700">
							{result.recommendations?.map((r: string, i: number) => (
								<li key={i}>{r}</li>
							))}
						</ul>
					</div>
					<div className="text-sm text-gray-500">Confidence: {result.confidence}</div>
				</div>
			)}
		</div>
	);
};

export default CropScanPage;
