import { Diamond, Database, Hash, Calendar, LinkIcon } from "lucide-react"

interface Field {
  name: string
  type: string
  icon: "database" | "hash" | "calendar" | "link"
}

interface DataModel {
  id: string
  name: string
  fields: Field[]
  relationships: string[]
}

interface DataModelCardProps {
  model: DataModel
}

const iconMap = {
  database: Database,
  hash: Hash,
  calendar: Calendar,
  link: LinkIcon,
}

export function DataModelCard({ model }: DataModelCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="bg-[#ff5001] px-3 py-2.5 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Diamond className="h-4 w-4 text-white fill-white" />
          <h3 className="text-sm font-medium text-white">{model.name}</h3>
        </div>
      </div>
      <div className="px-3 py-3">
        <div className="space-y-2">
          {model.fields.map((field, index) => {
            const Icon = iconMap[field.icon]
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Icon className="h-3.5 w-3.5 text-gray-700 flex-shrink-0" />
                <span className="text-gray-900">{field.name}</span>
                {field.icon === "link" && <LinkIcon className="ml-auto h-3.5 w-3.5 text-gray-700" />}
              </div>
            )
          })}
        </div>

        {model.relationships.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-400 mb-2">Relationships</p>
            <div className="space-y-2">
              {model.relationships.map((rel, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Diamond className="h-3.5 w-3.5 text-gray-700 flex-shrink-0" />
                  <span className="text-gray-900">{rel}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
