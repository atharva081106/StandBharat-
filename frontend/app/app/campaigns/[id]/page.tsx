import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CampaignDetail({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto w-full custom-scrollbar">
      <div className="p-8 max-w-6xl mx-auto space-y-6 pb-28">
      <h1 className="text-2xl font-semibold tracking-tight">Campaign: {params.id}</h1>
      <Card>
        <CardHeader><CardTitle>Performance Overview</CardTitle></CardHeader>
        <CardContent className="text-sm text-[#E5E7EB]">
           Campaign data will appear here.
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
