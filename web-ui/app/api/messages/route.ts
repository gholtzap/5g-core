import Docker from 'dockerode';
import { NextRequest, NextResponse } from 'next/server';
import { parseLogLine, extractTimestamp } from '@/lib/message-parser';
import { MessageFlowEntry } from '@/types/message-flow';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const CONTAINERS = ['amf', 'ausf', 'udm', 'smf', 'upf', 'nrf', 'nssf'];

async function fetchContainerLogs(
  containerName: string,
  since?: number,
  tail: number = 2000
): Promise<string[]> {
  try {
    const container = docker.getContainer(containerName);
    const logOptions: any = {
      stdout: true,
      stderr: true,
      timestamps: true,
      tail,
    };

    if (since) {
      logOptions.since = Math.floor(since / 1000);
    }

    const logs = await container.logs(logOptions) as unknown as Buffer;

    const lines: string[] = [];
    let offset = 0;

    while (offset < logs.length) {
      if (offset + 8 > logs.length) break;

      const header = logs.subarray(offset, offset + 8);
      const size = header.readUInt32BE(4);

      if (offset + 8 + size > logs.length) break;

      const logLine = logs.subarray(offset + 8, offset + 8 + size).toString('utf-8');
      if (logLine.trim()) {
        lines.push(logLine.trim());
      }

      offset += 8 + size;
    }

    return lines;
  } catch (error) {
    console.error(`Failed to fetch logs from ${containerName}:`, error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sinceParam = searchParams.get('since');
  const tailParam = searchParams.get('tail');

  const since = sinceParam ? parseInt(sinceParam, 10) : undefined;
  const tail = tailParam ? parseInt(tailParam, 10) : 2000;

  try {
    const logPromises = CONTAINERS.map((container) =>
      fetchContainerLogs(container, since, tail)
    );
    const allLogs = await Promise.all(logPromises);

    const messages: MessageFlowEntry[] = [];

    allLogs.forEach((logs, index) => {
      const container = CONTAINERS[index];

      logs.forEach((logLine) => {
        const timestamp = extractTimestamp(logLine);
        if (!timestamp) return;

        const message = parseLogLine(logLine, container, timestamp);
        if (message) {
          messages.push(message);
        }
      });
    });

    messages.sort((a, b) => a.timestampMs - b.timestampMs);

    return NextResponse.json({ messages, count: messages.length });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
